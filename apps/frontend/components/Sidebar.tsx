"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { deleteHistoryItem, fetchHistory } from "@/lib/api";
import type { HistoryItem } from "@/lib/types";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = useCallback(() => {
    fetchHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadHistory();
    window.addEventListener("research-complete", loadHistory);
    return () => window.removeEventListener("research-complete", loadHistory);
  }, [loadHistory]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    await deleteHistoryItem(id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(null);
    if (pathname === `/history/${id}`) {
      router.push("/");
    }
  }

  const activeId = pathname.startsWith("/history/")
    ? pathname.split("/history/")[1]
    : null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-surface-cream border-r border-hairline z-40">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-hairline shrink-0">
        <Link href="/" className="block group">
          <h1 className="font-serif text-xl text-on-surface font-normal tracking-tight group-hover:text-primary transition-colors">
            DeepTheoria
          </h1>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Advanced Research Agent
          </p>
        </Link>
      </div>

      {/* New Research */}
      <div className="px-3 py-3 shrink-0">
        <Link href="/">
          <button className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-mistral-orange text-white rounded-lg text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all">
            <span className="text-base leading-none font-light">+</span>
            New Research
          </button>
        </Link>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 sidebar-scroll">
        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest px-2 mb-2 mt-1">
          Research History
        </p>

        {loading && (
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 rounded-lg bg-hairline animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && history.length === 0 && (
          <p className="text-xs text-on-surface-variant px-2 py-3 italic">
            No research history yet.
          </p>
        )}

        <nav className="space-y-0.5">
          {history.map((item) => {
            const isActive = item.id === activeId;
            return (
              <div key={item.id} className="group relative">
                <Link
                  href={`/history/${item.id}`}
                  className={cn(
                    "flex items-center pl-2 pr-7 py-2 rounded-lg text-[13px] leading-snug transition-all",
                    isActive
                      ? "bg-cream-deep text-primary font-medium"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  )}
                >
                  <span className="truncate">{item.topic}</span>
                </Link>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  disabled={deletingId === item.id}
                  title="Delete"
                  className={cn(
                    "absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-[15px] text-on-surface-variant hover:text-destructive hover:bg-surface-container transition-all opacity-0 group-hover:opacity-100",
                    deletingId === item.id && "opacity-50 cursor-wait",
                  )}
                >
                  ×
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Sunset stripe */}
      <div className="sunset-stripe shrink-0" />
    </aside>
  );
}
