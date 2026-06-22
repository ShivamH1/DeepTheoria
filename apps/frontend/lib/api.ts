"use client";

import { useCallback, useRef, useState } from "react";
import type {
  HistoryItem,
  PhaseEvent,
  ResearchResult,
  ReviewState,
} from "./types";

export function useSSEResearch() {
  // currentPhase: 0=idle, 1-4=active phase number, -1=awaiting HITL review
  const [currentPhase, setCurrentPhase] = useState(0);
  const [revisionCount, setRevisionCount] = useState(0);
  const [awaitingReview, setAwaitingReview] = useState<ReviewState | null>(
    null,
  );
  const [liveReport, setLiveReport] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const startResearch = useCallback((topic: string) => {
    if (esRef.current) esRef.current.close();

    setCurrentPhase(1); // search starts immediately
    setRevisionCount(0);
    setAwaitingReview(null);
    setLiveReport("");
    setResult(null);
    setError(null);
    setIsRunning(true);

    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const es = new EventSource(
      `${base}/api/research/stream?topic=${encodeURIComponent(topic)}`,
    );
    esRef.current = es;

    es.onmessage = (e) => {
      const event: PhaseEvent = JSON.parse(e.data);

      if (event.error) {
        setError(event.error);
        setIsRunning(false);
        es.close();
        return;
      }

      // ── Token streaming (writer typing live) ──────────────────────────
      if (event.type === "token") {
        setLiveReport((prev) => prev + (event.content ?? ""));
        return;
      }

      // ── HITL: pipeline paused for human review ────────────────────────
      if (event.phase === "awaiting_review") {
        setCurrentPhase(-1);
        setAwaitingReview({
          threadId: event.thread_id!,
          searchResults: event.search_results ?? "",
          scrapedContent: event.scraped_content ?? "",
          scrapedSources: event.scraped_sources ?? [],
        });
        return;
      }

      const phase = event.phase as number;

      // ── Revision triggered: critic scored low, writer re-runs ─────────
      if (event.revision_triggered) {
        setRevisionCount((event.revision_count ?? 0) + 1);
        setLiveReport(""); // clear for fresh revision write
        setCurrentPhase(3);
        return;
      }

      // ── Final result ──────────────────────────────────────────────────
      if (event.done && event.data) {
        setResult(event.data);
        setIsRunning(false);
        setCurrentPhase(0);
        es.close();
        window.dispatchEvent(new CustomEvent("research-complete"));
        return;
      }

      // ── Normal phase completion: advance to next phase ────────────────
      setCurrentPhase(phase + 1);
    };

    es.onerror = () => {
      setError("Connection to research pipeline lost. Please try again.");
      setIsRunning(false);
      es.close();
    };
  }, []);

  const approveResearch = useCallback(async () => {
    if (!awaitingReview) return;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    await fetch(`${base}/api/research/approve/${awaitingReview.threadId}`, {
      method: "POST",
    });
    setCurrentPhase(3); // writer is next
    setAwaitingReview(null);
  }, [awaitingReview]);

  return {
    currentPhase,
    revisionCount,
    awaitingReview,
    liveReport,
    result,
    isRunning,
    error,
    startResearch,
    approveResearch,
  };
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${backendUrl}/api/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchHistoryItem(id: string): Promise<ResearchResult> {
  const res = await fetch(`${backendUrl}/api/history/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export async function deleteHistoryItem(id: string): Promise<void> {
  await fetch(`${backendUrl}/api/history/${id}`, { method: "DELETE" });
}
