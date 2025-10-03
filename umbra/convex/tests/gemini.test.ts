import { SYSTEM_PROMPTS, callGemini } from "../lib/gemini";
import { expect, jest, test } from "@jest/globals";

jest.setTimeout(30000); // Increase timeout for API calls

// Mock environment variables
jest.mock("process", () => ({
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "test-key",
    GEMINI_MODEL: "gemini-1.5-flash"
  }
}));

test("callGemini should return a response for SPACE_BIOLOGY_EXPERT prompt", async () => {
  const userPrompt = "What is the effect of microgravity on plant growth?";
  
  // Skip this test if no API key is set
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "test-key") {
    console.log("Skipping Gemini API test - no API key set");
    return;
  }
  
  const result = await callGemini({
    systemPrompt: SYSTEM_PROMPTS.SPACE_BIOLOGY_EXPERT,
    userPrompt
  });
  
  expect(typeof result).toBe("string");
  expect(result.length).toBeGreaterThan(0);
});

test("callGemini should return JSON for ENTITY_EXTRACTOR prompt", async () => {
  const testAbstract = "This study examines the effects of microgravity on Arabidopsis thaliana growth during ISS missions. Results show altered gene expression patterns in root development.";
  
  // Skip this test if no API key is set
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "test-key") {
    console.log("Skipping Gemini API test - no API key set");
    return;
  }
  
  const result = await callGemini({
    systemPrompt: SYSTEM_PROMPTS.ENTITY_EXTRACTOR,
    userPrompt: `Please extract entities from the following text:\n\nTitle: Plant Growth in Microgravity\n\nAbstract: ${testAbstract}`
  });
  
  expect(typeof result).toBe("string");
  // Should contain JSON structure
  expect(result.includes("organisms")).toBe(true);
  expect(result.includes("experimentalConditions")).toBe(true);
});

test("SYSTEM_PROMPTS should contain all required prompt types", () => {
  expect(SYSTEM_PROMPTS).toHaveProperty("SPACE_BIOLOGY_EXPERT");
  expect(SYSTEM_PROMPTS).toHaveProperty("ENTITY_EXTRACTOR");
  expect(SYSTEM_PROMPTS).toHaveProperty("RELATIONSHIP_FINDER");
  expect(SYSTEM_PROMPTS).toHaveProperty("SUMMARIZER");
  expect(SYSTEM_PROMPTS).toHaveProperty("CITATION_SUGGESTER");
  expect(SYSTEM_PROMPTS).toHaveProperty("RESEARCH_GAP_IDENTIFIER");
});