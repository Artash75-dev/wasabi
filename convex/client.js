import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("client").collect();
  },
});
export const getById = query({
  args: {
    _id: v.id("client"), // Ensure you're using the correct type
  },
  handler: async (ctx, { _id }) => {
    const result = await ctx.db.get(_id);
    if (!result) {
      throw new Error("Client not found");
    }
    return result;
  },
});

export const put = mutation({
  args: {
    first_name: v.string(),
    last_name: v.string(),
    phone: v.string(),
    address: v.string(),
    location: v.object({
      latitude: v.float64(),
      longitude: v.float64(),
    }),
  },
  handler: async (ctx, args) => {
    const { first_name, last_name, phone, address, location } = args;
    const newOrder = await ctx.db.insert("client", {
      first_name,
      last_name,
      phone,
      address,
      location,
    });
    return newOrder;
  },
});

export const patch = mutation({
  args: {
    _id: v.string(),
    first_name: v.string(),
    last_name: v.string(),
    phone: v.string(),
    address: v.string(),
    location: v.object({
      latitude: v.float64(),
      longitude: v.float64(),
    }),
  },
  handler: async (ctx, args) => {
    const findOrder = await ctx.db
      .query("client")
      .filter((q) => q.eq(q.field("_id"), args._id))
      .collect();
    await ctx.db.patch(findOrder[0]._id, args);
    return findOrder;
  },
});

export const deleteOrder = mutation({
  args: {
    _id: v.id("client"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args._id);
  },
});
