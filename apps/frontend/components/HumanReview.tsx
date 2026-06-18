"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ReviewState, ScrapedSource } from "@/lib/types";

interface HumanReviewProps {
  review: ReviewState;
  onApprove: () => Promise<void>;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ScraperHUD({ sources }: { sources: ScrapedSource[] }) {
  if (sources.length === 0) {
    return (
      <p className="text-xs text-on-surface-variant italic px-6 py-3">
        No source metadata available.
      </p>
    );
  }
  return (
    <ul className="px-6 py-3 space-y-1.5">
      {sources.map((src) => (
        <li key={src.url} className="flex items-start gap-2 text-sm">
          {src.status === "success" ? (
            <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5 shrink-0">
              check_circle
            </span>
          ) : (
            <span className="material-symbols-outlined text-[16px] text-destructive mt-0.5 shrink-0">
              cancel
            </span>
          )}
          <div className="min-w-0">
            <span className="font-medium text-on-surface truncate block">
              {getDomain(src.url)}
            </span>
            {src.status === "success" ? (
              <span className="text-xs text-on-surface-variant">
                {src.chars.toLocaleString()} chars scraped
              </span>
            ) : (
              <span className="text-xs text-destructive truncate block">
                {src.error ?? "Failed"}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function HumanReview({ review, onApprove }: HumanReviewProps) {
  const [approving, setApproving] = useState(false);

  async function handleApprove() {
    setApproving(true);
    await onApprove();
  }

  const successCount = review.scrapedSources.filter(
    (s) => s.status === "success",
  ).length;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="rounded-xl border border-outline-variant bg-cream-deep shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5">
            rate_review
          </span>
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-0.5">
              Human-in-the-Loop
            </p>
            <h3 className="font-serif text-lg text-on-surface font-normal">
              Review Gathered Research
            </h3>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Inspect what the pipeline found before the Writer Agent generates
              the report.
            </p>
          </div>
        </div>

        {/* Scraper Status HUD */}
        <div className="border-b border-hairline">
          <div className="px-6 py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-primary">
              link
            </span>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
              Scraped Sources
            </p>
            <span className="ml-auto text-[11px] text-emerald-700 font-medium">
              {successCount} / {review.scrapedSources.length} succeeded
            </span>
          </div>
          <ScraperHUD sources={review.scrapedSources} />
        </div>

        {/* Collapsible: Search Results & Scraped Content */}
        <div className="divide-y divide-hairline">
          <details className="group">
            <summary className="cursor-pointer px-6 py-3 flex items-center justify-between text-sm font-medium text-on-surface select-none hover:bg-surface-container-low transition-colors">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  travel_explore
                </span>
                Search Results
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>
            <div className="px-6 pb-4">
              <pre className="text-xs text-charcoal whitespace-pre-wrap leading-relaxed font-mono bg-canvas border border-hairline rounded-lg p-3 max-h-52 overflow-y-auto">
                {review.searchResults || "No search results captured."}
              </pre>
            </div>
          </details>

          <details className="group">
            <summary className="cursor-pointer px-6 py-3 flex items-center justify-between text-sm font-medium text-on-surface select-none hover:bg-surface-container-low transition-colors">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  content_paste_search
                </span>
                Combined Scraped Content ({successCount} sources)
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>
            <div className="px-6 pb-4">
              <pre className="text-xs text-charcoal whitespace-pre-wrap leading-relaxed font-mono bg-canvas border border-hairline rounded-lg p-3 max-h-52 overflow-y-auto">
                {review.scrapedContent || "No content scraped."}
              </pre>
            </div>
          </details>
        </div>

        {/* Approve CTA */}
        <div className="px-6 py-4 bg-canvas border-t border-hairline flex items-center justify-between gap-4">
          <p className="text-xs text-on-surface-variant">
            The Writer Agent will use only the content above to generate your
            report.
          </p>
          <Button
            onClick={handleApprove}
            disabled={approving}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-mistral-orange transition-colors px-5"
          >
            {approving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting Writer…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  edit_note
                </span>
                Approve &amp; Generate Report
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
