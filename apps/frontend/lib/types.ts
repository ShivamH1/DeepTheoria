export interface ScrapedSource {
  url: string
  status: "success" | "failed"
  chars: number
  error: string | null
}

export interface PhaseEvent {
  type?: "token" | "phase_complete"  // absent on gather-phase events (backward compat)
  phase: number | "awaiting_review"
  phase_name?: string
  done: boolean
  data?: ResearchResult
  error?: string
  // token streaming
  content?: string
  // revision
  revision_triggered?: boolean
  revision_count?: number
  score?: number
  // HITL review
  thread_id?: string
  search_results?: string
  scraped_content?: string
  scraped_sources?: ScrapedSource[]
}

export interface ReviewState {
  threadId: string
  searchResults: string
  scrapedContent: string
  scrapedSources: ScrapedSource[]
}

export interface ResearchResult {
  id: string
  topic: string
  search_results: string
  scraped_content: string
  report: string
  feedback: string
}

export interface HistoryItem {
  id: string
  topic: string
  report: string
  feedback: string
  created_at: string
}

export interface ParsedFeedback {
  score_val: number
  score_str: string
  strengths: string[]
  improvements: string[]
  verdict: string
}
