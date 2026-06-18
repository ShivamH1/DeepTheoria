"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ScoreCard from "@/components/ScoreCard";
import { parseFeedback } from "@/lib/parse-feedback";
import type { ResearchResult } from "@/lib/types";

interface ReportTabsProps {
  result: ResearchResult;
}

export default function ReportTabs({ result }: ReportTabsProps) {
  const [copied, setCopied] = useState(false);
  const feedback = parseFeedback(result.feedback);

  function downloadMd() {
    const blob = new Blob([result.report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research_${result.topic.replace(/\s+/g, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pipeline_state_${result.topic.replace(/\s+/g, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyReport() {
    navigator.clipboard.writeText(result.report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      <Tabs defaultValue="report">
        <TabsList className="bg-surface-container border border-hairline mb-6 rounded-lg">
          <TabsTrigger
            value="report"
            className="data-[state=active]:bg-canvas data-[state=active]:text-primary"
          >
            Research Report
          </TabsTrigger>
          <TabsTrigger
            value="critique"
            className="data-[state=active]:bg-canvas data-[state=active]:text-primary"
          >
            Critique Evaluation
          </TabsTrigger>
          <TabsTrigger
            value="raw"
            className="data-[state=active]:bg-canvas data-[state=active]:text-primary"
          >
            Raw Logs
          </TabsTrigger>
        </TabsList>

        {/* ── REPORT TAB ── */}
        <TabsContent value="report" className="outline-none focus:outline-none">
          <div className="rounded-xl border border-hairline bg-canvas p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-hairline pb-4 mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] select-none">
                  description
                </span>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
                  Document Draft
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReport}
                  className="text-xs border-hairline h-8 px-3 text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] select-none">
                    {copied ? "check" : "content_copy"}
                  </span>
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadMd}
                  className="text-xs border-hairline h-8 px-3 text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] select-none">
                    download
                  </span>
                  <span>Download .md</span>
                </Button>
              </div>
            </div>
            <div className="markdown-content">
              <ReactMarkdown>{result.report}</ReactMarkdown>
            </div>
          </div>
        </TabsContent>

        {/* ── CRITIQUE TAB ── */}
        <TabsContent
          value="critique"
          className="outline-none focus:outline-none"
        >
          <ScoreCard feedback={feedback} rawFeedback={result.feedback} />
        </TabsContent>

        {/* ── RAW LOGS TAB ── */}
        <TabsContent value="raw" className="outline-none focus:outline-none">
          <div className="space-y-4">
            <div className="rounded-xl border border-hairline bg-canvas p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-on-surface-variant/70 text-[18px] select-none">
                  travel_explore
                </span>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  1. Search Agent Output (Tavily)
                </h3>
              </div>
              <pre className="text-xs text-charcoal whitespace-pre-wrap leading-relaxed font-mono overflow-auto max-h-64 bg-surface-container rounded-lg p-3">
                {result.search_results}
              </pre>
            </div>

            <div className="rounded-xl border border-hairline bg-canvas p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-on-surface-variant/70 text-[18px] select-none">
                  html
                </span>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  2. Reader Agent Output (BeautifulSoup)
                </h3>
              </div>
              <pre className="text-xs text-charcoal whitespace-pre-wrap leading-relaxed font-mono overflow-auto max-h-64 bg-surface-container rounded-lg p-3">
                {result.scraped_content}
              </pre>
            </div>

            <Button
              variant="outline"
              onClick={downloadJson}
              className="w-full border-hairline text-on-surface-variant hover:text-on-surface h-10 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] select-none">
                download
              </span>
              <span>Export Full Pipeline State (.json)</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
