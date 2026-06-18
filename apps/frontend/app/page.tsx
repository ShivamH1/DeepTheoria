"use client";

import { useState } from "react";
import { useSSEResearch } from "@/lib/api";
import ResearchForm from "@/components/ResearchForm";
import PipelineProgress from "@/components/PipelineProgress";
import HumanReview from "@/components/HumanReview";
import LiveReport from "@/components/LiveReport";
import ReportTabs from "@/components/ReportTabs";

const SUGGESTIONS = [
  {
    title: "Solid-state battery progress",
    query:
      "Latest progress in solid-state battery technology and commercialization timelines",
    icon: "battery_charging_full",
    description: "Explore energy density and major developer roadmaps.",
  },
  {
    title: "Llama 3 vs GPT-4o",
    query:
      "Comparative analysis of Llama 3 and GPT-4o capabilities and open-source impact",
    icon: "compare_arrows",
    description: "Analyze benchmarks, fine-tuning potential, and efficiency.",
  },
  {
    title: "CRISPR gene therapy approvals",
    query:
      "Recent FDA approvals and clinical trials for CRISPR gene therapy in 2026",
    icon: "health_and_safety",
    description: "Investigate treatment pipelines and regulatory updates.",
  },
  {
    title: "Quantum computing qubits",
    query:
      "Current breakthroughs in quantum computing qubits stability and error correction",
    icon: "insights",
    description:
      "Look into superconducting qubits and physical error mitigation.",
  },
];

const PIPELINE_STEPS = [
  {
    name: "Web Search",
    desc: "Compile and rank high-authority sources via Tavily.",
    icon: "travel_explore",
  },
  {
    name: "Page Scraper",
    desc: "Extract raw content and clean text from pages.",
    icon: "html",
  },
  {
    name: "Writer Agent",
    desc: "Synthesize facts and draft the report in Markdown.",
    icon: "edit_note",
  },
  {
    name: "Critic Agent",
    desc: "Grade quality and trigger automated revisions.",
    icon: "fact_check",
  },
];

export default function HomePage() {
  const {
    currentPhase,
    revisionCount,
    awaitingReview,
    liveReport,
    result,
    isRunning,
    error,
    startResearch,
    approveResearch,
  } = useSSEResearch();

  const [topic, setTopic] = useState("");

  const showProgress = isRunning || currentPhase !== 0 || !!awaitingReview;

  function handleSelectSuggestion(query: string) {
    setTopic(query);
  }

  return (
    <div className="min-h-screen px-6 py-12 md:px-10 bg-background flex flex-col justify-between">
      <div className="flex-1">
        {/* Hero */}
        <div className="text-center mb-10 max-w-2xl mx-auto mt-4">
          <h2 className="font-serif text-4xl md:text-5xl text-on-surface font-normal tracking-tight mb-4 leading-tight">
            Frontier Intelligence.
            <br />
            <span className="text-primary">In your hands.</span>
          </h2>
          <p className="text-on-surface-variant text-base max-w-xl mx-auto leading-relaxed opacity-90">
            Multi-agent pipeline that searches the web, scrapes sources, drafts
            a report, and critiques it — automatically.
          </p>
        </div>

        {/* Research form */}
        <div className="max-w-2xl mx-auto">
          <ResearchForm
            topic={topic}
            setTopic={setTopic}
            onSubmit={startResearch}
            isRunning={isRunning}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto rounded-xl border border-destructive/40 bg-destructive/8 p-4 text-sm text-destructive animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {/* Pipeline progress (phases 1-4 cards) */}
        {showProgress && (
          <PipelineProgress
            currentPhase={currentPhase}
            revisionCount={revisionCount}
            result={result}
          />
        )}

        {/* HITL review panel — appears between phase 2 and 3 */}
        {awaitingReview && (
          <HumanReview review={awaitingReview} onApprove={approveResearch} />
        )}

        {/* Live report — visible while writer is typing and while critic evaluates */}
        {liveReport && !result && (
          <LiveReport content={liveReport} isComplete={currentPhase === 4} />
        )}

        {/* Final results — replaces live report once research is complete */}
        {result && <ReportTabs result={result} />}

        {/* Redesigned Empty State / Dashboard Dashboard */}
        {!showProgress && !result && !error && (
          <div className="mt-14 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            {/* Clickable Prompt Suggestions */}
            <div>
              <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest text-center mb-5">
                Suggested Research Topics
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(item.query)}
                    className="flex items-start text-left p-4 rounded-xl border border-hairline bg-canvas hover:border-primary/40 hover:shadow-sm hover:bg-surface-cream transition-all duration-300 cursor-pointer group"
                  >
                    <span className="material-symbols-outlined text-[24px] text-primary bg-cream-deep p-2 rounded-lg mr-3.5 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {item.icon}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm text-on-surface group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-on-surface-variant/75 leading-relaxed truncate md:whitespace-normal">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Agent Pipeline Map */}
            <div>
              <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest text-center mb-6">
                Multi-Agent Pipeline Map
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                {PIPELINE_STEPS.map((step, idx) => (
                  <div key={idx} className="relative flex flex-col">
                    <div className="flex-1 p-4 rounded-xl border border-hairline bg-canvas/60 flex flex-col items-center text-center space-y-2.5 transition-all hover:bg-canvas">
                      <span className="material-symbols-outlined text-[26px] text-on-surface-variant/70">
                        {step.icon}
                      </span>
                      <div className="space-y-1">
                        <p className="font-semibold text-xs text-on-surface uppercase tracking-wide">
                          {step.name}
                        </p>
                        <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                    {/* Flow arrow indicator for desktop (lg screen sizes) */}
                    {idx < 3 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-5 h-5 items-center justify-center bg-background rounded-full border border-hairline">
                        <span className="material-symbols-outlined text-[12px] text-on-surface-variant/50 select-none">
                          chevron_right
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!showProgress && !result && !error && (
        <div className="mt-16 text-center text-[11px] text-on-surface-variant/50 shrink-0">
          Powered by DeepTheoria multi-agent framework
        </div>
      )}
    </div>
  );
}
