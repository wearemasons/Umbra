import { v } from "convex/values";
import { mutation, action, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { SYSTEM_PROMPTS, callGemini } from "./lib/gemini";
import { Doc } from "./_generated/dataModel";

/**
 * Creates a new collaborative document.
 */
export const createDocument = mutation({
  args: { title: v.string(), ownerId: v.string() },
  handler: async (ctx, { title, ownerId }) => {
    const documentId = await ctx.db.insert("documents", {
      title,
      content: "", // Initialize with empty content
      ownerId,
    });
    return documentId;
  },
});

/**
 * Applies an operation to a document.
 * NOTE: This is a placeholder. A real implementation would use a library like Yjs
 * or CRDTs for concurrent edits.
 */
export const applyDocumentOperation = mutation({
  args: {
    documentId: v.id("documents"),
    operation: v.any(), // The operation to apply (e.g., insert, delete)
    authorId: v.string(),
  },
  handler: async (ctx, { documentId, operation, authorId }) => {
    console.log(`Received operation for doc ${documentId} from ${authorId}`);

    await ctx.db.insert("documentOperations", {
      documentId,
      operation,
      authorId,
    });

    const doc = await ctx.db.get(documentId);
    if (doc && operation.type === "insert") {
      const newContent =
        doc.content.slice(0, operation.pos) +
        operation.text +
        doc.content.slice(operation.pos);
      await ctx.db.patch(documentId, { content: newContent });
    }
  },
});

/**
 * Suggests relevant citations for a given portion of a document.
 */
export const suggestCitations = action({
  args: {
    documentId: v.id("documents"),
    context: v.string(),
  },
  handler: async (ctx, { documentId, context }) => {
    const publications = await ctx.runQuery(
      api.publications.getPublications,
      {},
    );
    const publicationTitles = publications.page
      .map((p: Doc<"publications">) => p.title)
      .join(", ");

    const userPrompt = `Document context: "${context}"

Available publications: [${publicationTitles}]

Suggest relevant publications from the list.`;

    try {
      const geminiResponse = await callGemini({
        systemPrompt: SYSTEM_PROMPTS.CITATION_SUGGESTER,
        userPrompt,
      });

      console.log("Gemini citation suggestion:", geminiResponse);

      const firstPub = publications.page[0];
      if (firstPub) {
        await ctx.runMutation(api.documents.storeCitationSuggestion, {
          documentId,
          context,
          suggestedPublicationId: firstPub._id,
          relevanceExplanation:
            "This publication was suggested by the AI assistant based on the document context.",
        });
      }

      return { success: true, suggestion: geminiResponse };
    } catch (error: any) {
      console.error("Failed to suggest citations:", error.message);
      return { success: false, error: error.message };
    }
  },
});

/**
 * Stores a suggested citation internally.
 */
export const storeCitationSuggestion = internalMutation({
  args: {
    documentId: v.id("documents"),
    context: v.string(),
    suggestedPublicationId: v.id("publications"),
    relevanceExplanation: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("citationSuggestions", {
      ...args,
      status: "pending" as const,
    });
  },
});
