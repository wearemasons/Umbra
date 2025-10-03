import { v } from "convex/values";
import {
  query,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { SYSTEM_PROMPTS, callGemini } from "./lib/gemini";
import { Id } from "./_generated/dataModel";

/**
 * Schedules the knowledge graph build process.
 */
export const scheduleBuild = internalAction({
  handler: async (ctx) => {
    await ctx.runAction(internal.knowledgeGraph.buildKnowledgeGraph, {});
  },
});

/**
 * Builds the knowledge graph by processing completed publications.
 */
export const buildKnowledgeGraph = internalAction({
  handler: async (ctx) => {
    const publications = await ctx.runQuery(
      internal.knowledgeGraph.getCompletedPublications,
      {},
    );

    for (const pub of publications) {
      const entities = [
        ...(pub.organisms || []),
        ...(pub.experimentalConditions || []),
        ...(pub.biologicalProcesses || []),
        ...(pub.spaceEnvironments || []),
      ];
      if (entities.length === 0) continue;

      // Create nodes for all entities
      const entityNodeIds = await ctx.runMutation(
        internal.knowledgeGraph.createNodesForEntities,
        { entities },
      );

      // Ask Gemini for relationships
      const userPrompt = `Given entities: ${JSON.stringify(entities)}
Publication abstract: ${pub.abstract}

Identify relationships and return them as a JSON array.`;

      try {
        const geminiResponse = await callGemini({
          systemPrompt: SYSTEM_PROMPTS.RELATIONSHIP_FINDER,
          userPrompt,
        });
        const relationships = JSON.parse(
          geminiResponse.replace(/```json|```/g, "").trim(),
        );

        if (relationships?.length > 0) {
          await ctx.runMutation(
            internal.knowledgeGraph.createEdgesForRelationships,
            {
              relationships,
              entityNodeIds,
              publicationId: pub._id,
            },
          );
        }
      } catch (error: any) {
        console.error(
          `Failed to find relationships for pub ${pub._id}:`,
          error.message,
        );
      }
    }
  },
});

/**
 * Fetches publications that are marked completed.
 */
export const getCompletedPublications = internalQuery({
  handler: async (ctx) => {
    return await ctx.db
      .query("publications")
      .withIndex("by_processingStatus", (q) =>
        q.eq("processingStatus", "completed"),
      )
      .collect();
  },
});

/**
 * Creates graph nodes for each entity.
 */
export const createNodesForEntities = internalMutation({
  args: { entities: v.array(v.string()) },
  handler: async (ctx, { entities }) => {
    const entityNodeIds = new Map<string, Id<"knowledgeGraphNodes">>();
    for (const entity of entities) {
      const existing = await ctx.db
        .query("knowledgeGraphNodes")
        .filter((q) => q.eq(q.field("label"), entity))
        .first();

      if (existing) {
        entityNodeIds.set(entity, existing._id);
      } else {
        const newNodeId = await ctx.db.insert("knowledgeGraphNodes", {
          label: entity,
          type: "unknown",
          importance: 1,
        });
        entityNodeIds.set(entity, newNodeId);
      }
    }
    return Object.fromEntries(entityNodeIds);
  },
});

/**
 * Creates edges for relationships between entities.
 */
export const createEdgesForRelationships = internalMutation({
  args: {
    relationships: v.array(v.array(v.any())),
    entityNodeIds: v.any(), // Map<string, Id>
    publicationId: v.id("publications"),
  },
  handler: async (ctx, { relationships, entityNodeIds, publicationId }) => {
    for (const rel of relationships) {
      const [source, type, target, confidence] = rel;
      const sourceId = entityNodeIds[source];
      const targetId = entityNodeIds[target];

      if (sourceId && targetId) {
        await ctx.db.insert("knowledgeGraphEdges", {
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          relationshipType: type,
          confidence,
          publicationIds: [publicationId],
        });
      }
    }
  },
});

/**
 * Retrieves the full knowledge graph for visualization.
 */
export const getKnowledgeGraph = query({
  handler: async (ctx) => {
    const nodes = await ctx.db.query("knowledgeGraphNodes").collect();
    const edges = await ctx.db.query("knowledgeGraphEdges").collect();
    return { nodes, edges };
  },
});

/**
 * Retrieves the full knowledge graph with publication dates for temporal visualization.
 */
export const getKnowledgeGraphWithTemporalData = query({
  handler: async (ctx) => {
    const nodes = await ctx.db.query("knowledgeGraphNodes").collect();
    const edges = await ctx.db.query("knowledgeGraphEdges").collect();
    
    // Get publication dates for temporal filtering
    const publicationIds = new Set<Id<"publications">>();
    edges.forEach(edge => {
      edge.publicationIds.forEach(pubId => publicationIds.add(pubId));
    });
    
    const publicationDates: Record<string, string> = {};
    for (const pubId of publicationIds) {
      const pub = await ctx.db.get(pubId);
      if (pub) {
        publicationDates[pubId] = pub.publicationDate;
      }
    }
    
    return { nodes, edges, publicationDates };
  },
});
