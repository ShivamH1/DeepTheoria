import { cn } from "@/lib/utils"
import type { ResearchResult } from "@/lib/types"

const PHASES = [
  { id: 1, label: "Web Search",    description: "Querying Tavily for latest sources",           icon: "public" },
  { id: 2, label: "Page Scraper",  description: "Extracting full content via BeautifulSoup",    icon: "content_paste_search" },
  { id: 3, label: "Writer Agent",  description: "Drafting structured Markdown report",           icon: "edit_note" },
  { id: 4, label: "Critic Agent",  description: "Evaluating quality and scoring report",         icon: "verified_user" },
]

interface PipelineProgressProps {
  currentPhase: number       // 0=idle, 1-4=running phase, -1=awaiting review
  revisionCount: number
  result: ResearchResult | null
}

export default function PipelineProgress({
  currentPhase,
  revisionCount,
  result,
}: PipelineProgressProps) {

  function phaseStatus(id: number): "done" | "active" | "pending" {
    if (result) return "done"
    if (currentPhase === -1) return id <= 2 ? "done" : "pending"
    if (currentPhase === 0)  return "pending"
    if (id < currentPhase)   return "done"
    if (id === currentPhase) return "active"
    return "pending"
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="flex items-center justify-between px-1 mb-4">
        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
          Pipeline Execution
        </p>
        {revisionCount > 0 && !result && (
          <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            Revision {revisionCount}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {PHASES.map((phase) => {
          const status = phaseStatus(phase.id)
          return (
            <div
              key={phase.id}
              className={cn(
                "rounded-xl border p-4 transition-all duration-300",
                status === "done"    && "border-primary/40 bg-accent",
                status === "active"  && "border-primary bg-canvas shadow-sm",
                status === "pending" && "border-hairline bg-canvas opacity-50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "material-symbols-outlined text-[20px]",
                    status !== "pending" ? "text-primary" : "text-on-surface-variant"
                  )}
                >
                  {phase.icon}
                </span>
                {status === "done" && (
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wide ml-auto">
                    Done
                  </span>
                )}
                {status === "active" && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-mistral-orange animate-pulse" />
                )}
              </div>
              <p className="font-semibold text-sm text-on-surface">{phase.label}</p>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {phase.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
