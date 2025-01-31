import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const put = mutation({
  args: {
    text: v.string(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("tasks", {
      text: args.text,
      isCompleted: args.isCompleted,
    });
    return newTaskId;
  },
});

export const patch = mutation({
  args: {
    isCompleted: v.boolean(),
    text: v.string(),
    _id: v.string(),
    _creationTime: v.float64(),
  },
  handler: async (ctx, args) => {
    const findTask = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("_id"), args._id))
      .collect();
    return await ctx.db.patch(findTask[0]._id, args);
  },
});