"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ReportTabs from "@/components/ReportTabs"
import { fetchHistoryItem } from "@/lib/api"
import type { ResearchResult } from "@/lib/types"

export default function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) =>
      fetchHistoryItem(id)
        .then(setResult)
        .catch(() => setError("Research session not found."))
        .finally(() => setLoading(false))
    )
  }, [params])

  return (
    <div className="min-h-screen px-6 py-10 md:px-10 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-0.5">
              arrow_back
            </span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {result && (
          <div className="mb-8 animate-in fade-in duration-300">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1.5">
              Research Archive
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-on-surface font-normal tracking-tight leading-tight">
              {result.topic}
            </h1>
          </div>
        )}

        {loading && (
          <div className="space-y-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-hairline bg-canvas animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/8 p-4 text-sm text-destructive mt-8">
            {error}
          </div>
        )}

        {result && <ReportTabs result={result} />}
      </div>
    </div>
  )
}

