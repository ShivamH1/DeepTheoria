import { cn } from "@/lib/utils"
import type { ParsedFeedback } from "@/lib/types"
import ReactMarkdown from "react-markdown"

interface ScoreCardProps {
  feedback: ParsedFeedback
  rawFeedback: string
}

export default function ScoreCard({ feedback, rawFeedback }: ScoreCardProps) {
  const scoreColor =
    feedback.score_val >= 8
      ? "from-emerald-500 to-emerald-600 border-emerald-400"
      : feedback.score_val >= 5
      ? "from-amber-500 to-amber-600 border-amber-400"
      : "from-red-500 to-red-600 border-red-400"

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Score banner */}
      <div className="flex items-center gap-5 rounded-xl border border-hairline bg-canvas p-5 shadow-sm">
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br border-2 text-white font-bold text-lg shrink-0",
            scoreColor
          )}
        >
          {feedback.score_str}
        </div>
        <div>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold mb-1">
            Quality Score
          </p>
          <p className="text-on-surface font-medium text-base italic">
            &ldquo;{feedback.verdict || "Evaluation complete."}&rdquo;
          </p>
        </div>
      </div>

      {/* Strengths + Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-hairline bg-canvas p-5 shadow-sm">
          <h3 className="font-semibold text-[11px] uppercase tracking-widest text-emerald-700 mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] select-none">check_circle</span>
            Strengths
          </h3>
          {feedback.strengths.length > 0 ? (
            <ul className="space-y-3">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
                  <div className="flex-1 text-sm text-on-surface-variant [&_strong]:text-on-surface [&_strong]:font-semibold [&_p]:m-0 leading-relaxed">
                    <ReactMarkdown>{s}</ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant italic">No strengths parsed.</p>
          )}
        </div>

        <div className="rounded-xl border border-hairline bg-canvas p-5 shadow-sm">
          <h3 className="font-semibold text-[11px] uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] select-none">lightbulb</span>
            Areas to Improve
          </h3>
          {feedback.improvements.length > 0 ? (
            <ul className="space-y-3">
              {feedback.improvements.map((imp, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 animate-pulse" />
                  <div className="flex-1 text-sm text-on-surface-variant [&_strong]:text-on-surface [&_strong]:font-semibold [&_p]:m-0 leading-relaxed">
                    <ReactMarkdown>{imp}</ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant italic">No improvements parsed.</p>
          )}
        </div>
      </div>

      {/* Raw output */}
      <details className="rounded-xl border border-hairline bg-canvas shadow-sm">
        <summary className="cursor-pointer px-5 py-4 text-sm text-on-surface-variant font-medium select-none hover:text-on-surface transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] select-none">analytics</span>
          <span>Full Raw Critique Output</span>
        </summary>
        <pre className="px-5 pb-5 text-xs text-charcoal whitespace-pre-wrap leading-relaxed font-mono border-t border-hairline pt-4 bg-surface-container-low rounded-b-xl overflow-x-auto">
          {rawFeedback}
        </pre>
      </details>
    </div>
  )
}
