import { v } from "convex/values";
import {
  mutation,
  query,
  internalAction,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { SYSTEM_PROMPTS, callGemini } from "./lib/gemini";
import { Doc } from "./_generated/dataModel";

/**
 * Schedules a publication for background processing to extract entities.
 */
export const scheduleProcessing = mutation({
  args: { publicationId: v.id("publications") },
  handler: async (ctx, { publicationId }) => {
    const pub = await ctx.db.get(publicationId);
    if (!pub) {
      console.error(`Publication with ID ${publicationId} not found.`);
      return;
    }
    await ctx.db.patch(publicationId, { processingStatus: "processing" });
    await ctx.scheduler.runAfter(0, internal.publications.processPublication, {
      publicationId,
    });
    console.log(`Scheduled processing for publication: ${publicationId}`);
  },
});

/**
 * Internal action to process a single publication using the Gemini API.
 */
export const processPublication = internalAction({
  args: { publicationId: v.id("publications") },
  handler: async (ctx, { publicationId }) => {
    const publication = await ctx.runQuery(
      internal.publications.getPublicationForProcessing,
      { publicationId },
    );

    if (!publication) {
      console.error(`Publication ${publicationId} not found for processing.`);
      await ctx.runMutation(internal.publications.updateStatus, {
        publicationId,
        status: "failed",
      });
      return;
    }

    const userPrompt = `Please extract entities from the following text:

Title: ${publication.title}

Abstract: ${publication.abstract}`;

    try {
      const geminiResponse = await callGemini({
        systemPrompt: SYSTEM_PROMPTS.ENTITY_EXTRACTOR,
        userPrompt,
      });

      const cleanedJsonString = geminiResponse
        .replace(/```json|```/g, "")
        .trim();
      const extractedData = JSON.parse(cleanedJsonString);

      if (!extractedData.organisms || !Array.isArray(extractedData.organisms)) {
        throw new Error(
          "Gemini response did not contain a valid 'organisms' array.",
        );
      }

      await ctx.runMutation(
        internal.publications.updatePublicationWithExtractedData,
        {
          publicationId,
          extractedData,
        },
      );
      console.log(
        `Successfully processed and updated publication: ${publicationId}`,
      );
    } catch (error: any) {
      console.error(
        `Failed to process publication ${publicationId}:`,
        error.message,
      );
      await ctx.runMutation(internal.publications.updateStatus, {
        publicationId,
        status: "failed",
      });
    }
  },
});

/**
 * Internal query to get a publication for processing.
 */
export const getPublicationForProcessing = internalQuery({
  args: { publicationId: v.id("publications") },
  handler: async (ctx, { publicationId }) => {
    return await ctx.db.get(publicationId);
  },
});

/**
 * Internal mutation to update the publication with extracted data.
 */
export const updatePublicationWithExtractedData = internalMutation({
  args: {
    publicationId: v.id("publications"),
    extractedData: v.object({
      organisms: v.array(v.string()),
      experimentalConditions: v.array(v.string()),
      biologicalProcesses: v.array(v.string()),
      spaceEnvironments: v.array(v.string()),
    }),
  },
  handler: async (ctx, { publicationId, extractedData }) => {
    await ctx.db.patch(publicationId, {
      ...extractedData,
      processingStatus: "completed",
    });
  },
});

/**
 * Internal mutation to update only the processing status.
 */
export const updateStatus = internalMutation({
  args: { publicationId: v.id("publications"), status: v.string() },
  handler: async (ctx, { publicationId, status }) => {
    await ctx.db.patch(publicationId, {
      processingStatus: status as Doc<"publications">["processingStatus"],
    });
  },
});

/**
 * Retrieves a paginated list of publications with optional filters.
 */
export const getPublications = query({
  args: {
    paginationOpts: v.any(),
    filters: v.optional(
      v.object({
        searchTerm: v.optional(v.string()),
        organism: v.optional(v.string()),
        environment: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { paginationOpts, filters }) => {
    if (filters?.searchTerm) {
      return await ctx.db
        .query("publications")
        .withSearchIndex("search_abstract", (q) =>
          q.search("abstract", filters.searchTerm!),
        )
        .paginate(paginationOpts);
    }

    let q = ctx.db.query("publications");

    if (filters?.organism) {
      q = q.filter((qb) =>
        qb.or(
          ...filters.organism
            .split(",")
            .map((org) => qb.eq(qb.field("organisms"), org.trim())),
        ),
      );
    }

    if (filters?.environment) {
      q = q.filter((qb) =>
        qb.or(
          ...filters.environment
            .split(",")
            .map((env) => qb.eq(qb.field("spaceEnvironments"), env.trim())),
        ),
      );
    }

    return await q.order("desc").paginate(paginationOpts);
  },
});

/**
 * Retrieves a single publication by ID.
 */
export const getPublicationDetail = query({
  args: { publicationId: v.id("publications") },
  handler: async (ctx, { publicationId }) => {
    return await ctx.db.get(publicationId);
  },
});
