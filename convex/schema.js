// Schema definition
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  order: defineTable({
    _id: v.string(),
    _creationTime: v.float64(),
    order_num: v.optional(v.float64()),
    spot_id: v.float64(),
    phone: v.string(),
    products: v.any(),
    bonus: v.optional(v.float64()), // Optional field
    notification: v.optional(v.boolean()),
    deliver_id: v.optional(v.float64()),
    admin_id: v.optional(v.float64()),
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
  }),
});
