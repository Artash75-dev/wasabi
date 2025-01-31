// Server queries and mutations
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all orders
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("order").collect();
  },
});

export const getById = query({
  args: {
    _id: v.id("order"),
  },
  handler: async (ctx, args) => {
    const { _id } = args;
    return await ctx.db.get(_id);
  },
});

export const getByStatus = query({
  args: {
    status: v.string(),
  },
  handler: async (ctx, { status }) => {
    let query = ctx.db.query("order");

    query = query.filter((q) => q.eq(q.field("status"), status));

    const orders = await query.order("desc").collect(); // Mos keladigan barcha buyurtmalarni olish
    return orders;
  },
});

export const getByChatId = query({
  args: {
    chat_id: v.float64(),
  },
  handler: async (ctx, { chat_id }) => {
    let query = ctx.db.query("order");

    query = query.filter((q) => q.eq(q.field("chat_id"), chat_id));

    const orders = await query.order("desc").collect(); // Mos keladigan barcha buyurtmalarni olish
    return orders;
  },
});

export const getByDeliverId = query({
  args: {
    status: v.optional(v.string()), // Optional status
    deliver_id: v.float64(), // Required deliver_id
  },
  handler: async (ctx, { status, deliver_id }) => {
    let query = ctx.db.query("order");

    query = query.filter((q) => q.eq(q.field("deliver_id"), deliver_id));

    if (status) {
      query = query.filter((q) => q.eq(q.field("status"), status));
    }

    const orders = await query.order("desc").collect(); // Collect all matching orders
    return orders;
  },
});
export const put = mutation({
  args: {
    spot_id: v.float64(),
    phone: v.string(),
    bonus: v.optional(v.float64()),
    notification: v.optional(v.boolean()),
    deliver_id: v.optional(v.float64()),
    admin_id: v.optional(v.float64()),
    products: v.any(),
    service_mode: v.float64(),
    payment_method: v.string(),
    total: v.float64(),
    chat_id: v.float64(),
    location: v.object({
      latitude: v.float64(),
      longitude: v.float64(),
    }),
    status: v.string(),
    client_id: v.float64(),
    delivery_price: v.optional(v.float64()),
    transaction_id: v.optional(v.float64()),
    incoming_order_id: v.optional(v.float64()),
    client_name: v.optional(v.string()),
    address: v.optional(v.string()),
    deliver_name: v.optional(v.string()),
    spot_name: v.optional(v.string()),
    comment: v.optional(v.string()),
    pers_num: v.optional(v.float64()),
    discount_price: v.optional(v.float64()),
    promocode: v.optional(v.string()),
    promocode_id: v.optional(v.float64()),
    pay_cash: v.optional(v.float64()),
    pay_card: v.optional(v.float64()),
    pay_click: v.optional(v.float64()),
    pay_payme: v.optional(v.float64()),
    pay_cache: v.optional(v.float64()),
    pay_sertificate: v.optional(v.float64()),
    pay_bonus: v.optional(v.float64()),
    spot_tablet_id: v.optional(v.float64()),
    delivery_time: v.optional(v.float64()),
    serviceOption: v.optional(v.any()),
    client_address_id: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    // Query the existing orders to find the maximum order_num
    const maxOrder = await ctx.db
      .query("order")
      .order("desc") // Sort by descending order of order_num
      .first(); // Get the first (highest order_num)

    // Calculate the next order number, starting from 1 if no orders exist
    const nextOrderNum = maxOrder ? maxOrder.order_num + 1 : 1;

    // Insert the new order with the calculated order_num
    const newOrder = await ctx.db.insert("order", {
      ...args,
      order_num: nextOrderNum, // Set the order_num to the calculated nextOrderNum
    });

    return newOrder; // Return the newly created order
  },
});

export const patch = mutation({
  args: {
    _id: v.id("order"),
    spot_id: v.optional(v.float64()),
    phone: v.optional(v.string()),
    bonus: v.optional(v.float64()),
    notification: v.optional(v.boolean()),
    deliver_id: v.optional(v.float64()),
    admin_id: v.optional(v.float64()),
    products: v.optional(v.any()),
    service_mode: v.optional(v.float64()),
    payment_method: v.optional(v.string()),
    total: v.optional(v.float64()),
    chat_id: v.optional(v.float64()),
    location: v.optional(
      v.object({
        latitude: v.float64(),
        longitude: v.float64(),
      })
    ),
    status: v.optional(v.string()),
    client_id: v.optional(v.float64()),
    delivery_price: v.optional(v.float64()),
    transaction_id: v.optional(v.float64()),
    incoming_order_id: v.optional(v.float64()),
    client_name: v.optional(v.string()),
    address: v.optional(v.string()),
    deliver_name: v.optional(v.string()),
    spot_name: v.optional(v.string()),
    comment: v.optional(v.string()),
    pers_num: v.optional(v.float64()),
    discount_price: v.optional(v.float64()),
    promocode: v.optional(v.string()),
    promocode_id: v.optional(v.float64()),
    pay_cash: v.optional(v.float64()),
    pay_cache: v.optional(v.float64()),
    pay_click: v.optional(v.float64()),
    pay_payme: v.optional(v.float64()),
    pay_card: v.optional(v.float64()),
    pay_sertificate: v.optional(v.float64()),
    pay_bonus: v.optional(v.float64()),
    spot_tablet_id: v.optional(v.float64()),
    delivery_time: v.optional(v.float64()),
    serviceOption: v.optional(v.any()),
    client_address_id: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { _id, ...updateData } = args;

    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(_id, filteredUpdateData);

    return filteredUpdateData;
  },
});

export const deleteOrder = mutation({
  args: {
    _id: v.id("order"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args._id);
  },
});
