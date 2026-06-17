from langchain_core.prompts import ChatPromptTemplate

writer_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert research writer and technical analyst. Your style is objective, "
            "data-driven, and highly structured. You strictly avoid fluff, marketing speak, and speculation.",
        ),
        (
            "human",
            """You are tasked with writing a comprehensive, professional research report on the topic below.

            ### TOPIC
            {topic}

            ### SOURCE RESEARCH DATA
            Use ONLY the following research data to write the report. Do NOT assume, extrapolate, or use external knowledge not present here:
            {research}

            ### REVISION/CRITIQUE INSTRUCTIONS
            {revision_instruction}
            *(Note: If the block above is empty or states 'None', proceed with the initial draft. Otherwise, modify the previous draft strictly following these instructions.)*

            ### WRITING CONSTRAINTS & FORMATTING
            1. **Grounding:** Every factual claim must be backed by the provided research. Do not introduce facts from outside this context.
            2. **Citations:** Implement inline hyperlinks pointing directly to the source URLs when stating facts (e.g., "...as discussed in the [Tavily Report](https://example.com/source)").
            3. **Structure:**
            # [Topic Title]
            
            ## 1. Introduction
            Provide a concise executive summary and context of the topic.
            
            ## 2. Key Findings
            List a minimum of 3 detailed, well-explained key findings. Use bullet points for sub-points if helpful, but ensure each finding is thoroughly detailed.
            
            ## 3. Conclusion
            Summarize the implications and wrap up the report.
            
            ## 4. Referenced Sources
            Provide a bulleted list of all unique URLs used in the report.

            Draft the report below following these instructions precisely:""",
        ),
    ]
)

critic_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a meticulous, constructive, and highly demanding peer-review editor. "
            "Your job is to ensure reports are accurate, comprehensive, and strictly follow instructions.",
        ),
        (
            "human",
            """Please evaluate the draft research report below against the provided criteria.

            ### RESEARCH REPORT TO REVIEW
            {report}

            ### EVALUATION CRITERIA
            1. **Factual Grounding (1-4 points):** Are all claims backed by data? (No unsupported assertions).
            2. **Structure & Formatting (1-3 points):** Does it follow the structure (Intro, Key Findings, Conclusion, Sources) with proper Markdown? Are inline citations used?
            3. **Depth & Completeness (1-3 points):** Are there at least 3 well-explained findings? Is the coverage thorough?

            ### RESPONSE SCHEMA
            Respond in this exact markdown format below. Ensure the tags `[SCORE]`, `[STRENGTHS]`, `[IMPROVEMENTS]`, and `[VERDICT]` are written exactly as shown:

            [SCORE]
            Score: <Sum of points from criteria, e.g., 8>/10

            [STRENGTHS]
            - <Specific strength 1>
            - <Specific strength 2>

            [IMPROVEMENTS]
            - <Specific actionable instruction to improve the report 1>
            - <Specific actionable instruction to improve the report 2>

            [VERDICT]
            <One-line constructive verdict on the report quality>""",
        ),
    ]
)
