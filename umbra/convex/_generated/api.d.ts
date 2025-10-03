/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as documents from "../documents.js";
import type * as embeddings from "../embeddings.js";
import type * as knowledgeGraph from "../knowledgeGraph.js";
import type * as lib_gemini from "../lib/gemini.js";
import type * as publications from "../publications.js";
import type * as researchGaps from "../researchGaps.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  embeddings: typeof embeddings;
  knowledgeGraph: typeof knowledgeGraph;
  "lib/gemini": typeof lib_gemini;
  publications: typeof publications;
  researchGaps: typeof researchGaps;
  search: typeof search;
  seed: typeof seed;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
