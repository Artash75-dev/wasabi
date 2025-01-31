import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admin").collect();
  },
});

export const post = query({
  args: {
    login: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { login, password }) => {
    const admin = await ctx.db
      .query("admin")
      .filter((q) => q.eq(q.field("login"), login))
      .filter((q) => q.eq(q.field("password"), password))
      .first();
    if (!admin) {
      throw new Error("Invalid login or password");
    }
    return admin;
  },
});

export const put = mutation({
  args: {
    login: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const { login, password, role } = args;
    const newOrder = await ctx.db.insert("admin", {
      login,
      password,
      role,
    });
    return newOrder;
  },
});

export const patch = mutation({
  args: {
    _id: v.string(),
    _creationTime: v.float64(),
    login: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const findOrder = await ctx.db
      .query("admin")
      .filter((q) => q.eq(q.field("_id"), args._id))
      .collect();
    return await ctx.db.patch(findOrder[0]._id, args);
  },
});

export const deleteOrder = mutation({
  args: {
    _id: v.id("admin"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args._id);
  },
});
