import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable not set!");
}
const genAI = new GoogleGenerativeAI(apiKey);

// The embedding model to use
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

/**
 * Schedules the generation of embeddings for a given publication.
 */
export const scheduleEmbeddingGeneration = internalAction({
  args: { publicationId: v.id("publications") },
  handler: async (ctx, { publicationId }) => {
    await ctx.runAction(internal.embeddings.generateEmbeddings, {
      publicationId,
    });
  },
});

/**
 * Generates embeddings for the title and abstract of a publication.
 */
export const generateEmbeddings = internalAction({
  args: { publicationId: v.id("publications") },
  handler: async (ctx, { publicationId }) => {
    const publication = await ctx.runQuery(
      api.publications.getPublicationDetail,
      { publicationId },
    );

    if (!publication) {
      console.error(
        `Publication ${publicationId} not found, cannot generate embeddings.`,
      );
      return;
    }

    const textSections = [
      { section: "title", content: publication.title },
      { section: "abstract", content: publication.abstract },
    ];

    try {
      for (const { section, content } of textSections) {
        if (!content) continue; // Skip if section is empty

        // Generate embedding
        const result = await embeddingModel.embedContent(content);
        const embedding = result.embedding.values;

        // Store the embedding in the database
        await ctx.runMutation(internal.embeddings.storeEmbedding, {
          publicationId: publication._id,
          section,
          embedding,
        });
      }
      console.log(
        `Successfully generated and stored embeddings for publication ${publicationId}`,
      );
    } catch (error: any) {
      console.error(
        `Failed to generate embeddings for publication ${publicationId}:`,
        error.message,
      );
    }
  },
});

/**
 * Stores a single embedding vector in the database.
 */
export const storeEmbedding = internalMutation({
  args: {
    publicationId: v.id("publications"),
    section: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, { publicationId, section, embedding }) => {
    await ctx.db.insert("embeddings", {
      publicationId,
      section,
      embedding,
    });
  },
});
