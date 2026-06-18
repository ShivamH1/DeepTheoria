"use client";

import { Button } from "@/components/ui/button";

interface ResearchFormProps {
  topic: string;
  setTopic: (val: string) => void;
  onSubmit: (topic: string) => void;
  isRunning: boolean;
}

export default function ResearchForm({
  topic,
  setTopic,
  onSubmit,
  isRunning,
}: ResearchFormProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed || isRunning) return;
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all duration-300 rounded-2xl border border-hairline bg-canvas shadow-sm flex items-center p-1.5 gap-2"
    >
      <div className="flex-1 flex items-center min-w-0 pl-3">
        <span className="material-symbols-outlined text-on-surface-variant/40 text-[22px] select-none shrink-0">
          search
        </span>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Latest progress in solid-state battery technology..."
          disabled={isRunning}
          className="w-full h-11 border-0 bg-transparent py-2 pl-2.5 pr-3 text-base text-on-surface placeholder:text-on-surface-variant/40 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
        />
      </div>
      <Button
        type="submit"
        disabled={isRunning || !topic.trim()}
        className="h-11 px-5 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-mistral-orange active:scale-[0.98] transition-all shrink-0 flex items-center gap-1.5"
      >
        {isRunning ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            <span>Researching…</span>
          </>
        ) : (
          <>
            <span>Generate</span>
            <span className="material-symbols-outlined text-[16px] leading-none">
              arrow_forward
            </span>
          </>
        )}
      </Button>
    </form>
  );
}
