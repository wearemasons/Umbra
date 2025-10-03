import { getKnowledgeGraph, scheduleBuild } from "../knowledgeGraph";
import { expect, jest, test } from "@jest/globals";

test("getKnowledgeGraph should return nodes and edges", async () => {
  const mockCtx: any = {
    db: {
      query: jest.fn(() => ({
        collect: jest.fn().mockResolvedValue([])
      }))
    }
  };

  const result = await getKnowledgeGraph.handler(mockCtx);

  expect(result).toHaveProperty("nodes");
  expect(result).toHaveProperty("edges");
  expect(Array.isArray(result.nodes)).toBe(true);
  expect(Array.isArray(result.edges)).toBe(true);
});

test("scheduleBuild should trigger knowledge graph construction", async () => {
  const mockCtx: any = {
    runAction: jest.fn().mockResolvedValue(undefined)
  };

  // This test just verifies the function can be called without error
  await expect(scheduleBuild.handler(mockCtx, {})).resolves.not.toThrow();
});