"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { HistoryItem } from "@/lib/types"

interface HistoryCardProps {
  item: HistoryItem
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function HistoryCard({ item, onDelete }: HistoryCardProps) {
  const preview = item.report.slice(0, 180).replace(/[#*`]/g, "")

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors">
      <div>
        <p className="text-xs text-muted-foreground mb-1">{formatDate(item.created_at)}</p>
        <h3 className="font-semibold text-foreground line-clamp-2">{item.topic}</h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{preview}…</p>
      </div>
      <div className="flex gap-2 mt-auto">
        <Link href={`/history/${item.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View Report
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="text-xs text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
