import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  publications: defineTable({
    title: v.string(),
    authors: v.array(v.string()),
    abstract: v.string(),
    publicationDate: v.string(),
    doi: v.string(),
    pdfUrl: v.string(),
    keywords: v.array(v.string()),
    processingStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    citationCount: v.number(),
    viewCount: v.number(),
    // Extracted entities
    organisms: v.optional(v.array(v.string())),
    experimentalConditions: v.optional(v.array(v.string())),
    biologicalProcesses: v.optional(v.array(v.string())),
    spaceEnvironments: v.optional(v.array(v.string())),
  }).searchIndex("search_abstract", {
    searchField: "abstract",
  }),

  embeddings: defineTable({
    publicationId: v.id("publications"),
    section: v.string(), // e.g., title, abstract, methods
    embedding: v.array(v.float64()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 768,
    filterFields: ["publicationId", "section"],
  }),

  searchQueries: defineTable({
    query: v.string(),
    synthesizedAnswer: v.string(),
    timestamp: v.number(),
  }),

  knowledgeGraphNodes: defineTable({
    label: v.string(),
    type: v.string(), // e.g., organism, condition
    importance: v.number(),
  }).index("by_label_and_type", ["label", "type"]),

  knowledgeGraphEdges: defineTable({
    sourceNodeId: v.id("knowledgeGraphNodes"),
    targetNodeId: v.id("knowledgeGraphNodes"),
    relationshipType: v.string(),
    confidence: v.float64(),
    publicationIds: v.array(v.id("publications")),
  }),

  documents: defineTable({
    title: v.string(),
    content: v.string(), // Could be a Yjs doc format
    ownerId: v.string(), // User ID
  }),

  documentOperations: defineTable({
    documentId: v.id("documents"),
    operation: v.any(), // OT or CRDT operation
    authorId: v.string(),
  }),

  citationSuggestions: defineTable({
    documentId: v.id("documents"),
    context: v.string(),
    suggestedPublicationId: v.id("publications"),
    relevanceExplanation: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
  }),

  researchGaps: defineTable({
    title: v.string(),
    description: v.string(),
    priority: v.float64(),
    impact: v.string(),
    relevantMissions: v.array(v.string()),
  }),
});