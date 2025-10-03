import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Core Publications Data
  publications: defineTable({
    title: v.string(),
    authors: v.array(v.string()),
    abstract: v.string(),
    publicationDate: v.string(),
    doi: v.optional(v.string()),
    pdfUrl: v.string(),
    fullTextContent: v.string(),

    // Metadata
    journalName: v.optional(v.string()),
    volume: v.optional(v.string()),
    issue: v.optional(v.string()),
    pageRange: v.optional(v.string()),
    keywords: v.array(v.string()),

    // NASA-specific metadata
    nasaId: v.optional(v.string()),
    geneLabId: v.optional(v.string()),
    missionRelevance: v.optional(v.array(v.string())),

    // Extracted structured data
    organisms: v.array(v.string()),
    experimentalConditions: v.array(v.string()),
    biologicalProcesses: v.array(v.string()),
    spaceEnvironments: v.array(v.string()), // microgravity, radiation, etc.
    experimentDuration: v.optional(v.string()),
    sampleSize: v.optional(v.number()),

    // Vector embedding for semantic search
    embeddingId: v.optional(v.id("embeddings")),

    // Statistics
    citationCount: v.number(),
    viewCount: v.number(),

    // Processing status
    processingStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    lastProcessed: v.optional(v.number()),
  })
    .index("by_publication_date", ["publicationDate"])
    .index("by_nasa_id", ["nasaId"])
    .index("by_processing_status", ["processingStatus"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["organisms", "spaceEnvironments"],
    }),

  // Vector Embeddings for Semantic Search
  embeddings: defineTable({
    publicationId: v.id("publications"),
    sectionType: v.union(
      v.literal("title"),
      v.literal("abstract"),
      v.literal("introduction"),
      v.literal("methods"),
      v.literal("results"),
      v.literal("discussion"),
      v.literal("conclusion"),
      v.literal("full_text"),
    ),
    embedding: v.array(v.float64()),
    textContent: v.string(),
    startPosition: v.optional(v.number()),
    endPosition: v.optional(v.number()),
  })
    .index("by_publication", ["publicationId"])
    .index("by_section", ["sectionType"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768, // sentence-transformers dimension
      filterFields: ["publicationId", "sectionType"],
    }),

  // Knowledge Graph Nodes
  knowledgeNodes: defineTable({
    nodeType: v.union(
      v.literal("organism"),
      v.literal("biological_process"),
      v.literal("experimental_condition"),
      v.literal("space_environment"),
      v.literal("finding"),
      v.literal("hypothesis"),
    ),
    name: v.string(),
    description: v.string(),
    aliases: v.array(v.string()),

    // Graph positioning for visualization
    xPosition: v.optional(v.float64()),
    yPosition: v.optional(v.float64()),

    // Metadata
    frequency: v.number(), // how often this node appears across publications
    importance: v.float64(), // calculated importance score

    // Associated publications
    publicationIds: v.array(v.id("publications")),

    // Taxonomy/hierarchy
    parentNodeId: v.optional(v.id("knowledgeNodes")),
    taxonomyLevel: v.optional(v.string()),
  })
    .index("by_type", ["nodeType"])
    .index("by_name", ["name"])
    .index("by_parent", ["parentNodeId"])
    .searchIndex("search_nodes", {
      searchField: "name",
      filterFields: ["nodeType"],
    }),

  // Knowledge Graph Edges (Relationships)
  knowledgeEdges: defineTable({
    sourceNodeId: v.id("knowledgeNodes"),
    targetNodeId: v.id("knowledgeNodes"),

    relationshipType: v.union(
      v.literal("affects"),
      v.literal("studied_in"),
      v.literal("causes"),
      v.literal("correlates_with"),
      v.literal("part_of"),
      v.literal("similar_to"),
      v.literal("contradicts"),
    ),

    strength: v.float64(), // relationship strength (0-1)
    confidence: v.float64(), // extraction confidence (0-1)

    // Supporting evidence
    publicationIds: v.array(v.id("publications")),
    evidenceCount: v.number(),

    // Extracted context
    contextSnippets: v.array(v.string()),

    // Temporal information
    firstObserved: v.string(), // publication date of first observation
    lastObserved: v.string(), // publication date of last observation
  })
    .index("by_source", ["sourceNodeId"])
    .index("by_target", ["targetNodeId"])
    .index("by_relationship", ["relationshipType"])
    .index("by_source_and_target", ["sourceNodeId", "targetNodeId"]),

  // Collaborative Documents
  documents: defineTable({
    title: v.string(),
    content: v.string(), // operational transformation document state

    // Document metadata
    documentType: v.union(
      v.literal("research_paper"),
      v.literal("review_article"),
      v.literal("grant_proposal"),
      v.literal("mission_plan"),
      v.literal("technical_report"),
      v.literal("notes"),
    ),

    // Ownership and permissions
    ownerId: v.id("users"),
    collaboratorIds: v.array(v.id("users")),
    isPublic: v.boolean(),

    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("in_review"),
      v.literal("published"),
      v.literal("archived"),
    ),

    // Timestamps
    createdAt: v.number(),
    lastModified: v.number(),
    publishedAt: v.optional(v.number()),

    // References and citations
    citedPublicationIds: v.array(v.id("publications")),
    linkedNodeIds: v.array(v.id("knowledgeNodes")),

    // Analytics
    wordCount: v.number(),
    editCount: v.number(),
    viewCount: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_modified", ["lastModified"])
    .searchIndex("search_documents", {
      searchField: "title",
      filterFields: ["documentType", "status", "isPublic"],
    }),

  // Document Operations (for operational transformation)
  documentOperations: defineTable({
    documentId: v.id("documents"),
    userId: v.id("users"),

    operationType: v.union(
      v.literal("insert"),
      v.literal("delete"),
      v.literal("retain"),
      v.literal("format"),
    ),

    position: v.number(),
    content: v.optional(v.string()),
    length: v.optional(v.number()),
    attributes: v.optional(v.any()),

    // Operation tracking
    version: v.number(), // document version when operation was applied
    timestamp: v.number(),
    clientId: v.string(),

    // Conflict resolution
    isApplied: v.boolean(),
    conflictsWith: v.optional(v.array(v.id("documentOperations"))),
  })
    .index("by_document", ["documentId"])
    .index("by_version", ["documentId", "version"])
    .index("by_timestamp", ["documentId", "timestamp"]),

  // Document Comments and Annotations
  documentComments: defineTable({
    documentId: v.id("documents"),
    userId: v.id("users"),

    // Comment positioning
    startPosition: v.number(),
    endPosition: v.number(),
    selectedText: v.string(),

    // Comment content
    content: v.string(),
    threadId: v.optional(v.id("documentComments")), // for nested replies

    // Status
    isResolved: v.boolean(),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),

    // Referenced content
    linkedPublicationIds: v.array(v.id("publications")),
    linkedNodeIds: v.array(v.id("knowledgeNodes")),
  })
    .index("by_document", ["documentId"])
    .index("by_thread", ["threadId"])
    .index("by_user", ["userId"])
    .index("by_resolved", ["documentId", "isResolved"]),

  // AI-Generated Citations and Suggestions
  citationSuggestions: defineTable({
    documentId: v.id("documents"),
    position: v.number(),
    context: v.string(), // surrounding text context

    // Suggested publications
    publicationId: v.id("publications"),
    relevanceScore: v.float64(),
    suggestedText: v.string(),

    // Suggestion metadata
    suggestionType: v.union(
      v.literal("citation"),
      v.literal("evidence"),
      v.literal("related_work"),
      v.literal("methodology"),
    ),

    // User interaction
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("modified"),
    ),
    acceptedBy: v.optional(v.id("users")),
    acceptedAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_status", ["documentId", "status"])
    .index("by_publication", ["publicationId"]),

  // Search Query History and Analytics
  searchQueries: defineTable({
    userId: v.optional(v.id("users")),
    query: v.string(),
    queryType: v.union(
      v.literal("natural_language"),
      v.literal("keyword"),
      v.literal("advanced"),
    ),

    // Filters applied
    filters: v.object({
      organisms: v.optional(v.array(v.string())),
      spaceEnvironments: v.optional(v.array(v.string())),
      dateRange: v.optional(
        v.object({
          start: v.string(),
          end: v.string(),
        }),
      ),
      experimentDuration: v.optional(v.string()),
    }),

    // Results
    resultCount: v.number(),
    resultPublicationIds: v.array(v.id("publications")),

    // Analytics
    timestamp: v.number(),
    responseTime: v.number(), // milliseconds
    clickedResults: v.array(v.id("publications")),

    // AI-generated response
    synthesizedAnswer: v.optional(v.string()),
    sourceAttribution: v.optional(
      v.array(
        v.object({
          publicationId: v.id("publications"),
          relevanceScore: v.float64(),
        }),
      ),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .searchIndex("search_queries", {
      searchField: "query",
    }),

  // Users
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),

    // Role and permissions
    role: v.union(
      v.literal("scientist"),
      v.literal("program_manager"),
      v.literal("mission_architect"),
      v.literal("admin"),
    ),

    // Profile information
    institution: v.optional(v.string()),
    researchInterests: v.array(v.string()),
    bio: v.optional(v.string()),

    // Preferences
    preferredOrganisms: v.array(v.string()),
    notificationSettings: v.object({
      documentMentions: v.boolean(),
      collaborationInvites: v.boolean(),
      newPublications: v.boolean(),
    }),

    // Activity tracking
    lastActive: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Research Gaps (identified by AI)
  researchGaps: defineTable({
    title: v.string(),
    description: v.string(),

    // Gap characteristics
    gapType: v.union(
      v.literal("organism_understudied"),
      v.literal("condition_untested"),
      v.literal("process_unclear"),
      v.literal("conflicting_results"),
      v.literal("limited_sample_size"),
    ),

    // Related entities
    relatedNodeIds: v.array(v.id("knowledgeNodes")),
    relatedPublicationIds: v.array(v.id("publications")),

    // Priority and impact
    priorityScore: v.float64(),
    potentialImpact: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
    ),

    // Mission relevance
    relevantMissions: v.array(v.string()), // lunar, mars, ISS, etc.

    // Community engagement
    upvotes: v.number(),
    upvotedBy: v.array(v.id("users")),
    comments: v.array(v.string()),

    // Status
    status: v.union(
      v.literal("identified"),
      v.literal("under_investigation"),
      v.literal("funded"),
      v.literal("resolved"),
    ),

    identifiedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["gapType"])
    .index("by_priority", ["priorityScore"])
    .index("by_status", ["status"])
    .index("by_impact", ["potentialImpact"]),

  // Experimental Protocols (extracted from publications)
  protocols: defineTable({
    publicationId: v.id("publications"),
    title: v.string(),
    description: v.string(),

    // Protocol details
    organism: v.string(),
    duration: v.string(),
    conditions: v.array(v.string()),
    equipment: v.array(v.string()),
    measurements: v.array(v.string()),

    // Structured steps
    steps: v.array(
      v.object({
        order: v.number(),
        description: v.string(),
        duration: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),

    // Outcomes
    successRate: v.optional(v.float64()),
    challenges: v.array(v.string()),

    // Usage tracking
    citedByDocuments: v.array(v.id("documents")),
    usageCount: v.number(),

    extractedAt: v.number(),
  })
    .index("by_publication", ["publicationId"])
    .index("by_organism", ["organism"]),
});
