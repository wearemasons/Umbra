import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to create a user for Password provider
export const createUser = mutation({
  args: {
    email: v.string(),
    // Add more fields as needed (e.g., name)
  },
  handler: async (ctx, args) => {
    // Insert a user document with the required fields
    return await ctx.db.insert("users", { email: args.email });
  },
});

// Convex Auth setup with Password and Anonymous providers
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password(), Anonymous],
});

// Query to get the currently logged-in user
export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
