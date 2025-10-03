import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable not set!");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Get the model from environment, default to gemini-1.5-flash
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// Simple rate limiter for Gemini calls
const rateLimiter = {
  calls: 0,
  resetTime: Date.now() + 60000, // 1 minute
  async checkLimit() {
    if (Date.now() > this.resetTime) {
      this.calls = 0;
      this.resetTime = Date.now() + 60000;
    }
    // Assuming 60 calls per minute limit (adjust as needed based on your API plan)
    if (this.calls >= 50) { // Leave some buffer
      const sleepTime = this.resetTime - Date.now();
      await new Promise(r => setTimeout(r, sleepTime));
      this.calls = 0;
      this.resetTime = Date.now() + 60000;
    }
    this.calls++;
  }
};

/**
 * Interface for parameters passed to the callGemini function
 */
interface CallGeminiParams {
  systemPrompt: string;
  userPrompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Calls the Gemini API with the provided parameters
 */
export async function callGemini({
  systemPrompt,
  userPrompt,
  context,
  temperature = 0.7,
  maxTokens = 2048
}: CallGeminiParams): Promise<string> {
  // Wait if we need to respect the rate limit
  await rateLimiter.checkLimit();

  try {
    // Combine system prompt with user prompt
    const fullPrompt = `${systemPrompt}\n\n${context ? `Context: ${context}\n\n` : ''}User request: ${userPrompt}`;
    
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      }
    });

    const response = result.response;
    if (!response) {
      throw new Error("No response from Gemini API");
    }

    return response.text();
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    // Retry logic for certain types of errors
    if (error.code === "RESOURCE_EXHAUSTED" || error.message.includes("quota")) {
      // Wait longer for rate limit issues
      console.log("Hit quota limit, waiting 10 seconds before retrying...");
      await new Promise(r => setTimeout(r, 10000));
      // Retry once
      try {
        const result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${context ? `Context: ${context}\n\n` : ''}User request: ${userPrompt}` }]
          }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
          }
        });

        const response = result.response;
        if (!response) {
          throw new Error("No response from Gemini API on retry");
        }

        return response.text();
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        throw new Error(`Gemini API error after retry: ${retryError}`);
      }
    } else {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

/**
 * Enum of system prompts for different use cases
 */
export const SYSTEM_PROMPTS = {
  SPACE_BIOLOGY_EXPERT: `You are an expert in space biology and astrobiology. You understand the effects of space environments (microgravity, radiation, etc.) on biological systems. Provide scientifically accurate information based on current research.`,

  ENTITY_EXTRACTOR: `You are an entity extraction system for space biology publications. 
Extract and return the following information in JSON format:
{
  "organisms": ["string"],
  "experimentalConditions": ["string"], 
  "biologicalProcesses": ["string"],
  "spaceEnvironments": ["string"]
}

Identify:
- Organisms: Specific species or types of organisms studied (e.g., "Arabidopsis thaliana", "mice", "bacteria")
- Experimental conditions: Environmental conditions in the study (e.g., "microgravity", "radiation", "temperature")
- Biological processes: Biological mechanisms studied (e.g., "gene expression", "cell division", "bone density")
- Space environments: Space-related environments (e.g., "ISS", "simulated Mars", "LEO")

Return only the JSON response, no additional text.`,

  RELATIONSHIP_FINDER: `You are analyzing a space biology publication to identify relationships between entities.
Given entities and publication abstract, identify relationships in this format:
[["Source Entity", "Relationship Type", "Target Entity", "Confidence (0-1)"], ...]

Relationship types: affects, causes, correlates_with, studied_in, part_of
Only include relationships explicitly stated or strongly implied in the text.
Return only the JSON array, no additional text.`,

  SUMMARIZER: `You are a scientific summarizer for space biology publications. Create concise, accurate summaries that capture the key findings, methods, and implications of the research. Focus on the most significant results and their relevance to space biology.`,

  CITATION_SUGGESTER: `You are assisting a scientist writing a research document about space biology.
Based on the provided document context, suggest relevant NASA publications that would support this section. For each suggestion, explain:
1. Why it's relevant
2. What specific finding or methodology it contributes
3. Suggested citation text

Return your response as a JSON array with this structure:
[
  {
    "publicationId": "string",
    "relevanceExplanation": "string",
    "suggestedCitation": "string"
  }
]`,

  RESEARCH_GAP_IDENTIFIER: `You are analyzing NASA space biology research to identify critical knowledge gaps.

Knowledge graph summary:
- Studied organisms: {organisms}
- Experimental conditions: {conditions}
- Number of publications per topic: {stats}

Identify 5 critical research gaps that:
1. Impact human space exploration missions
2. Have insufficient experimental evidence
3. Are technically feasible to study
4. Would provide high scientific value

For each gap, provide:
- Title (concise)
- Description (2-3 sentences)
- Priority score (0-1)
- Potential impact (critical/high/medium/low)
- Relevant missions (lunar, mars, ISS)

Return your response as a JSON array with this structure:
[
  {
    "title": "string",
    "description": "string",
    "priority": number,
    "impact": "critical|high|medium|low",
    "relevantMissions": ["string"]
  }
]`
};