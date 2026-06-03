import type { ParsedFeedback } from "./types"

export function parseFeedback(feedbackStr: string): ParsedFeedback {
  const parsed: ParsedFeedback = {
    score_val: 0,
    score_str: "N/A",
    strengths: [],
    improvements: [],
    verdict: "",
  }

  try {
    const lines = feedbackStr
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    let currentSection: "strengths" | "improvements" | "verdict" | null = null

    for (const line of lines) {
      const scoreMatch = line.match(
        /(?:score|rating):\s*(\d+(?:\.\d+)?)\s*(?:\/\s*\d+)?/i
      )
      if (scoreMatch) {
        const val = parseFloat(scoreMatch[1])
        parsed.score_val = val
        parsed.score_str = `${Number.isInteger(val) ? val : val}/10`
        continue
      }

      if (/^[\[#*\s]*strengths[\]#*\s-:]*$/i.test(line) || /^[\[#*\s]*strengths:/i.test(line)) {
        currentSection = "strengths"
        continue
      }
      if (/^[\[#*\s]*(?:areas to improve|improvements)[\]#*\s-:]*$/i.test(line) || /^[\[#*\s]*(?:areas to improve|improvements):/i.test(line)) {
        currentSection = "improvements"
        continue
      }
      if (/^[\[#*\s]*(?:one[- ]line verdict|verdict)[\]#*\s-:]*$/i.test(line) || /^[\[#*\s]*(?:one[- ]line verdict|verdict):/i.test(line)) {
        currentSection = "verdict"
        const afterColon = line.split(":").slice(1).join(":").trim()
        if (afterColon) parsed.verdict = afterColon
        continue
      }

      if (currentSection === "verdict") {
        parsed.verdict += " " + line
      } else if (/^(?:[-*]|\d+\.)\s+/.test(line)) {
        const cleaned = line.replace(/^(?:[-*]|\d+\.)\s*/, "").trim()
        if (cleaned && currentSection === "strengths") parsed.strengths.push(cleaned)
        else if (cleaned && currentSection === "improvements") parsed.improvements.push(cleaned)
      }
    }

    parsed.verdict = parsed.verdict.trim()
  } catch {
    parsed.verdict = feedbackStr
  }

  return parsed
}
