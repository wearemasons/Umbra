import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { callGemini } from "./lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Doc } from "./_generated/dataModel";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable not set!");
}
const genAI = new GoogleGenerativeAI(apiKey);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

const searchSystemPrompt = `You are an expert space biology research assistant. Given a user's question and relevant excerpts from NASA publications, provide a comprehensive answer that:
1. Directly answers the question.
2. Cites specific publications using [Doc X] notation, where X is the number of the document.
3. Highlights key findings and experimental evidence.
4. Notes any conflicting results or knowledge gaps.
5. Keeps responses concise but scientifically accurate.`;

/**
 * Performs a semantic search over publications.
 */
export const semanticSearch = action({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    // 1. Generate an embedding for the user's query.
    const result = await embeddingModel.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // 2. Perform a vector search to find the most relevant documents.
    const searchResults = await ctx.vectorSearch("embeddings", "by_embedding", {
      vector: queryEmbedding,
      limit: 16,
      // Note: Vector search filters work differently in Convex
      // We'll filter the results after retrieval instead
    });

    // 3. Filter for abstract sections and get unique publication IDs
    const abstractResults = searchResults.filter(
      (r) => r.section === "abstract",
    );
    const uniquePublicationIds = [
      ...new Set(abstractResults.map((r) => r.publicationId)),
    ];
    const publications = await Promise.all(
      uniquePublicationIds.map(async (id) => {
        try {
          return await ctx.db.get(id);
        } catch {
          return null;
        }
      }),
    );
    const validPublications = publications.filter(
      (p): p is Doc<"publications"> => p !== null,
    );

    // 4. Prepare the context for the Gemini chat model.
    const context = validPublications
      .map(
        (pub, i) =>
          `[Doc ${i + 1}] Title: ${pub.title}\nAbstract: ${pub.abstract}`,
      )
      .join("\n\n");

    const userPrompt = `Context from publications:\n${context}\n\nUser question: ${query}`;

    // 5. Call Gemini to synthesize an answer.
    const synthesizedAnswer = await callGemini({
      systemPrompt: searchSystemPrompt,
      userPrompt,
    });

    // 6. Store the query and its answer.
    await ctx.runMutation(internal.search.storeSearchResult, {
      query,
      synthesizedAnswer,
    });

    // 7. Return the synthesized answer and the source publications.
    return {
      synthesizedAnswer,
      sourcePublications: validPublications,
    };
  },
});

/**
 * Stores the result of a semantic search in the database.
 */
export const saveSearchQuery = internalMutation({
  args: { query: v.string(), synthesizedAnswer: v.string() },
  handler: async (
    ctx,
    { query, synthesizedAnswer }: { query: string; synthesizedAnswer: string },
  ) => {
    await ctx.db.insert("searchQueries", {
      query,
      synthesizedAnswer,
      timestamp: Date.now(),
    });
  },
});
