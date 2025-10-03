
# Umbra Space Biology Platform - Convex Backend

This directory contains the complete backend logic for the Umbra platform, built on [Convex](https://convex.dev/).

## Overview

The backend is responsible for:
- Ingesting and processing NASA publication data.
- Generating embeddings for semantic search.
- Providing an AI-powered search API.
- Constructing and querying a knowledge graph.
- Handling real-time document collaboration and citation suggestions.
- Identifying research gaps in the field of space biology.

## Core Technologies

- **Backend Framework**: Convex
- **Language**: TypeScript
- **AI Model**: Google Gemini API (via `@google/generative-ai`)
- **Database**: Convex's built-in transactional database

## File Structure

```
convex/
├── schema.ts           # Defines the database schema for all tables.
├── seed.ts             # Mutation to seed the database from a CSV file.
├── publications.ts     # Functions for processing and querying publications.
├── embeddings.ts       # Action for generating text embeddings.
├── search.ts           # Action for performing AI-powered semantic search.
├── knowledgeGraph.ts   # Functions for building and querying the knowledge graph.
├── documents.ts        # Functions for collaborative documents and citations.
├── researchGaps.ts     # Action for identifying research gaps.
├── utils.ts            # Helper functions (e.g., CSV parsing).
├── lib/
│   └── gemini.ts       # Core module for interacting with the Gemini API.
└── tests/              # (Placeholder) Tests for the backend functions.
```

## Getting Started

### 1. Environment Variables

Before running any functions, you must set the following environment variables in your [Convex project settings](https://dashboard.convex.dev/):

- `GEMINI_API_KEY`: Your API key for the Google Gemini service.
- `GEMINI_MODEL`: (Optional) The Gemini model to use (e.g., `gemini-1.5-pro`). Defaults to `gemini-1.5-flash`.

### 2. Seeding the Database

The database is populated from a CSV file containing NASA publication metadata. 

1.  **Obtain `sources.csv`**: Ensure you have the CSV file with publication data.
2.  **Call the `seedFromFile` mutation**: Use a client-side script or the Convex dashboard to call the `seed.seedFromFile` mutation, passing the entire content of the CSV file as the `csvContent` argument.

```typescript
// Example of calling the seeding mutation from a client
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function Seeder() {
  const seed = useMutation(api.seed.seedFromFile);
  const handleSeed = (csvContent) => {
    seed({ csvContent });
  };
  // ...
}
```

### 3. Processing Publications

After seeding, each publication needs to be processed to extract entities.

- Call the `publications.scheduleProcessing` mutation for each publication ID. This will schedule a background job to call the Gemini API and extract entities.

## API Documentation

### Publications

- `publications.getPublications`: Query to get a paginated list of publications. Supports filtering by search term, organism, and environment.
  - Args: `{ paginationOpts: object, filters: { searchTerm?: string, organism?: string, environment?: string } }`
  - Returns: Paginated list of publications

- `publications.getPublicationDetail`: Query to get the full details of a single publication.
  - Args: `{ publicationId: string }`
  - Returns: Complete publication document

- `publications.scheduleProcessing`: Mutation to schedule AI processing of a publication to extract entities.
  - Args: `{ publicationId: string }`
  - Returns: void (schedules background processing)

### Search

- `search.semanticSearch`: Action that takes a natural language `query` and returns a synthesized answer along with source publications.
  - Args: `{ query: string }`
  - Returns: `{ synthesizedAnswer: string, sourcePublications: Publication[] }`

### Knowledge Graph

- `knowledgeGraph.getKnowledgeGraph`: Query that returns all nodes and edges for visualization.
  - Args: none
  - Returns: `{ nodes: KnowledgeGraphNode[], edges: KnowledgeGraphEdge[] }`

- `knowledgeGraph.scheduleBuild`: Action to schedule construction of the knowledge graph from processed publications.
  - Args: none
  - Returns: void (triggers background job)

### Documents

- `documents.createDocument`: Mutation to create a new collaborative document.
  - Args: `{ title: string, ownerId: string }`
  - Returns: Document ID

- `documents.applyDocumentOperation`: Mutation to apply an editing operation to a document.
  - Args: `{ documentId: string, operation: object, authorId: string }`
  - Returns: void

- `documents.suggestCitations`: Action that takes a `documentId` and `context` string to provide citation suggestions.
  - Args: `{ documentId: string, context: string }`
  - Returns: `{ success: boolean, suggestion: string }`

### Research Gaps

- `researchGaps.identifyResearchGaps`: Action that analyzes the knowledge graph to identify critical research gaps.
  - Args: none
  - Returns: `{ success: boolean, researchGaps: ResearchGap[] }`

### Embeddings

- `embeddings.scheduleEmbeddingGeneration`: Action to schedule embedding generation for a publication.
  - Args: `{ publicationId: string }`
  - Returns: void (triggers background job)

---

## System Architecture

### Processing Pipeline
1. **Seeding**: Call `seed.seedFromFile` with CSV content to populate initial data
2. **Processing**: Call `publications.scheduleProcessing` for each publication to extract entities
3. **Embedding**: Call `embeddings.scheduleEmbeddingGeneration` to generate vector embeddings
4. **Graph Construction**: Call `knowledgeGraph.scheduleBuild` to build the knowledge graph
5. **Search**: Use `search.semanticSearch` to perform AI-powered semantic searches

### Data Flow
- Raw publication data → Entity extraction (Gemini) → Structured entities → Knowledge graph
- Text content → Embedding generation → Vector store → Semantic search
- User queries → Vector search → AI summarization → Answer synthesis

This backend provides a comprehensive, AI-driven foundation for the Umbra platform, ready for frontend integration.
