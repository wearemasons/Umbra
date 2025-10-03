import { semanticSearch } from "../search";
import { expect, jest, test } from "@jest/globals";

jest.setTimeout(60000); // Increase timeout for API calls

test("semanticSearch should return results for a space biology query", async () => {
  // Skip this test if no API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.log("Skipping semantic search test - no API key set");
    return;
  }
  
  const mockCtx: any = {
    vectorSearch: jest.fn().mockResolvedValue([]),
    runQuery: jest.fn().mockResolvedValue({ page: [] }),
    runMutation: jest.fn().mockResolvedValue(undefined)
  };

  const result = await semanticSearch.handler(mockCtx, { 
    query: "What are the effects of microgravity on plant growth?" 
  });

  // The result should have the expected structure
  expect(result).toHaveProperty("synthesizedAnswer");
  expect(result).toHaveProperty("sourcePublications");
  expect(typeof result.synthesizedAnswer).toBe("string");
  expect(Array.isArray(result.sourcePublications)).toBe(true);
});