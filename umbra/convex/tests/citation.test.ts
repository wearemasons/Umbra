import { suggestCitations, createDocument } from "../documents";
import { expect, jest, test } from "@jest/globals";

test("createDocument should create a new document", async () => {
  const mockCtx: any = {
    db: {
      insert: jest.fn().mockResolvedValue("doc_123")
    }
  };

  const result = await createDocument.handler(mockCtx, { 
    title: "Test Document", 
    ownerId: "user_123" 
  });

  expect(result).toBe("doc_123");
});

test("suggestCitations should return citation suggestions", async () => {
  // Skip this test if no API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.log("Skipping citation suggestion test - no API key set");
    return;
  }
  
  const mockCtx: any = {
    runQuery: jest.fn().mockResolvedValue({ page: [] }),
    runMutation: jest.fn().mockResolvedValue(undefined)
  };

  const result = await suggestCitations.handler(mockCtx, { 
    documentId: "doc_123" as any, 
    context: "This is a paragraph about plant growth in microgravity." 
  });

  expect(result).toHaveProperty("success");
  expect(typeof result.success).toBe("boolean");
});