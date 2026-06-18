"use client";

import ReactMarkdown from "react-markdown";

interface LiveReportProps {
  content: string;
  isComplete: boolean; // true when writer done but critic still running
}

export default function LiveReport({ content, isComplete }: LiveReportProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      <div className="rounded-xl border border-hairline bg-canvas p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-0.5">
              Research Report
            </p>
          </div>
          <div className="ml-auto">
            {!isComplete ? (
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-mistral-orange animate-pulse" />
                Writing…
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <span className="material-symbols-outlined text-[14px]">
                  check_circle
                </span>
                Written — Evaluating
              </span>
            )}
          </div>
        </div>

        {/* Streaming content */}
        <div className="border-t border-hairline pt-5 prose prose-stone prose-sm max-w-none [&_h2]:text-primary [&_h3]:text-on-surface [&_h3]:font-serif [&_h3]:font-normal [&_a]:text-primary [&_strong]:text-on-surface [&_li]:text-on-surface-variant [&_p]:text-on-surface-variant [&_blockquote]:border-primary/50 [&_blockquote]:text-on-surface-variant">
          <ReactMarkdown>{content}</ReactMarkdown>
          {!isComplete && (
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
