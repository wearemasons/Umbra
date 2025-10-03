import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { SYSTEM_PROMPTS, callGemini } from "./lib/gemini";

/**
 * Action: Identifies potential research gaps by analyzing
 * the knowledge graph and passing summary stats to Gemini.
 */
export const identifyResearchGaps = action({
  handler: async (ctx) => {
    // 1. Collect graph statistics
    const { nodes, edges } = await ctx.runQuery(
      api.knowledgeGraph.getKnowledgeGraph,
      {},
    );

    const organismNodes = nodes.filter((n: any) => n.type === "organism");
    const conditionNodes = nodes.filter((n: any) => n.type === "condition");

    const statsSummary = {
      organisms: organismNodes.map((n) => n.label),
      conditions: conditionNodes.map((n) => n.label),
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
      },
    };

    // 2. Ask Gemini to identify gaps based on stats
    const userPrompt = `Knowledge graph summary:\n${JSON.stringify(statsSummary, null, 2)}`;

    try {
      const geminiResponse = await callGemini({
        systemPrompt: SYSTEM_PROMPTS.RESEARCH_GAP_IDENTIFIER,
        userPrompt,
      });

      const researchGaps = JSON.parse(
        geminiResponse.replace(/```json|```/g, "").trim(),
      );

      // 3. Persist gaps
      await ctx.runMutation(internal.researchGaps.storeResearchGaps, {
        researchGaps,
      });

      return { success: true, researchGaps };
    } catch (error: any) {
      console.error("Failed to identify research gaps:", error.message);
      return { success: false, error: error.message };
    }
  },
});

/**
 * Internal mutation: Persists research gaps in the database.
 */
export const storeResearchGaps = internalMutation({
  args: {
    researchGaps: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        priority: v.number(),
        impact: v.string(),
        relevantMissions: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, { researchGaps }) => {
    for (const gap of researchGaps) {
      await ctx.db.insert("researchGaps", gap);
    }
    console.log(`Stored ${researchGaps.length} research gaps.`);
  },
});
