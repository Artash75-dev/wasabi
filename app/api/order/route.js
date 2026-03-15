import { api } from "@/convex/_generated/api";
import {
  isBotLikeCreatingSource,
  isBotLikeSource,
} from "@/lib/orderSource";
import { postApi } from "@/lib/requestApi";
import { fetchMutation, fetchQuery } from "convex/nextjs";

const getProductAggregateKey = (product) =>
  [
    +product?.product_id || 0,
    product?.promotion_id ? `promo:${+product.promotion_id}` : "promo:none",
    product?.isBonusProduct ? "bonus:1" : "bonus:0",
    product?.fixedPrice != null ? `fixed:${product.fixedPrice}` : "fixed:none",
    product?.conditionProductId
      ? `cond:${+product.conditionProductId}`
      : "cond:none",
  ].join("|");

const buildPosterInvolvedProducts = (product) => {
  if (Array.isArray(product?.promotionTrigger) && product.promotionTrigger.length > 0) {
    return product.promotionTrigger
      .filter((trigger) => +trigger?.id > 0 && +trigger?.count > 0)
      .map((trigger) => ({
        id: +trigger.id,
        count: +trigger.count,
      }));
  }

  if (+product?.conditionProductId > 0) {
    return [
      {
        id: +product.conditionProductId,
        count: +product?.countDisc > 0 ? +product.countDisc : 1,
      },
    ];
  }

  return [
    {
      id: +product.product_id,
      count: +product?.countDisc > 0 ? +product.countDisc : 1,
    },
  ];
};

const buildPosterPromotionData = (products = []) => {
  const activePromotionProducts = products.filter((product) => product?.promotion_id);
  const promotionData = [];

  activePromotionProducts.forEach((product) => {
    const resultType = +(product?.result_type ?? product?.discount?.params?.result_type ?? 0);
    const promoId = +product.promotion_id;
    const promotionCount = Math.max(
      1,
      +(product?.resultProductCount || product?.count || 1)
    );

    if (!promoId) {
      return;
    }

    if (resultType === 1 || product?.isBonusProduct) {
      const involvedProducts = buildPosterInvolvedProducts(product);
      if (involvedProducts.length === 0) {
        return;
      }

      for (let index = 0; index < promotionCount; index += 1) {
        promotionData.push({
          id: promoId,
          involved_products: involvedProducts,
          result_products: [
            {
              id: +(product?.resultProductId || product?.product_id),
              count: 1,
            },
          ],
        });
      }
      return;
    }

    for (let index = 0; index < Math.max(1, +product?.count || 1); index += 1) {
      promotionData.push({
        id: promoId,
        involved_products: [
          {
            id: +product.product_id,
            count: 1,
          },
        ],
      });
    }
  });

  return promotionData;
};

// let OpenStreetMapProvider;
// if (typeof window !== "undefined") {
//   // Dynamically import only on the client side
//   OpenStreetMapProvider = require("leaflet-geosearch").OpenStreetMapProvider;
// }

export async function GET(request) {
  const url = new URL(request.url);
  const _id = url.searchParams.get("id");

  try {
    let order;
    if (_id) {
      order = await fetchQuery(api.order.getById, { _id });
      if (!order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify(order), { status: 200 });
    } else {
      order = await fetchQuery(api.order.get);
      return new Response(JSON.stringify(order), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const args = await request.json();

    const {
      _id,
      spot_id,
      phone,
      products,
      service_mode,
      payment_method,
      total,
      chat_id,
      location,
      status,
      client_id,
      delivery_price,
      transaction_id,
      incoming_order_id,
      deliver_name,
      address,
      client_name,
      spot_name,
      comment,
      pers_num,
      bonus,
      delivery_time,
      discount_price,
      serviceOption,
      pay_cash,
      pay_card,
      pay_sertificate,
      pay_bonus,
      client_address_id,
      pay_payme,
      pay_click,
      promocode,
      promocode_id
    } = args;

    let productsData = products.map((item) => {
      const {
        product_name,
        product_id,
        count,
        modifications,
        category_name,
        menu_category_id,
        photo,
        price,
        promotion_id,
        result_type,
        isBonusProduct,
        conditionType,
        conditionProductId,
        fixedPrice,
        resultProductId,
        resultProductCount,
        bonusDiscountPercent,
        promotionTrigger,
      } = item;

      return {
        product_id,
        product_name,
        count,
        modifications: modifications ? modifications : [],
        category_name,
        menu_category_id,
        photo,
        price,
        promotion_id,
        result_type,
        isBonusProduct,
        conditionType,
        conditionProductId,
        fixedPrice,
        resultProductId,
        resultProductCount,
        bonusDiscountPercent,
        promotionTrigger,
      };
    });

    productsData = productsData?.reduce((acc, curr) => {
      const existingProduct = acc.find(
        (product) => getProductAggregateKey(product) === getProductAggregateKey(curr)
      );

      if (existingProduct) {
        existingProduct.count += curr.count;
      } else {
        acc.push({ ...curr });
      }

      return acc;
    }, []);

    // Bonus mahsulotlarni Poster uchun products ro'yxatidan chiqarish (Poster o'zi qo'shadi)
    let filterProducts = productsData.filter((p) => !p?.isBonusProduct).map((p) => {
      if (!p?.modifications?.length > 0 && !serviceOption?.id) {
        return {
          product_id: p.product_id,
          count: p.count,
        };
      } else if (!p?.modifications?.length > 0 && serviceOption?.id) {
        return {
          product_id: p.product_id,
          count: p.count,
          price: +p?.price * 100,
        };
      }
    });
    productsData.filter((p) => !p?.isBonusProduct).forEach((product) => {
      if (product?.modifications?.length > 0) {
        const findModif = product?.modifications?.map((md) => {
          return {
            product_id: product.product_id,
            modificator_id: md.modificator_id,
            count: md.count,
            price: md?.spots[0]?.price,
          };
        });
        filterProducts = [...filterProducts, ...findModif];
      }
    });

    const promotionData = buildPosterPromotionData(productsData);

    let response;
    let addressData = "";
    console.log({ address });
    if (address) {
      addressData = address;
    } else {
      if (isBotLikeSource(status) && location.longitude && location.latitude) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${location?.latitude}&lon=${location?.longitude}&format=json&accept-language=ru`
          );
          const addressRes = await res.json();
          addressData = addressRes?.display_name;
          console.log(addressRes);
        } catch (error) {
          addressData = "";
          console.error("Error fetching address:", error);
        }
      }
    }
    console.log("Address Data:", addressData);
    const payload = {
      spot_id: Number(spot_id),
      phone,
      products: productsData,
      service_mode: Number(service_mode),
      payment_method,
      delivery_price: Number(delivery_price),
      total: Number(total),
      chat_id: Number(chat_id),
      location,
      status,
      client_id: Number(client_id),
      transaction_id: Number(transaction_id),
      incoming_order_id: Number(incoming_order_id),
      deliver_name,
      address: String(addressData),
      client_name,
      spot_name,
      comment,
      pers_num: Number(pers_num),
      bonus: Number(bonus),
      discount_price: Number(discount_price),
      delivery_time: Number(delivery_time),
      pay_cash: Number(pay_cash),
      pay_payme: Number(pay_payme),
      pay_click: Number(pay_click),
      pay_card: Number(pay_card),
      pay_sertificate: Number(pay_sertificate),
      pay_bonus: Number(pay_bonus),
      client_address_id: Number(client_address_id),
      promocode,
    };
    let posterPayload;
    if (service_mode == 2) {
      posterPayload = {
        url: `incomingOrders.createIncomingOrder`,
        body: {
          spot_id: Number(spot_id),
          client_id: Number(client_id),
          service_mode: Number(service_mode),
          phone,
          products: filterProducts.filter((product) => product != null),
          promotion: promotionData,
        },
      };
    }
    if (service_mode == 3) {
      posterPayload = {
        url: `incomingOrders.createIncomingOrder`,
        body: {
          spot_id: Number(spot_id),
          client_id: Number(client_id),
          service_mode: Number(service_mode),
          delivery_price: Number(delivery_price * 100),
          client_address: {
            address1: address,
            lat: location?.latitude,
            lng: location?.longitude,
          },
          phone,
          products: filterProducts.filter((product) => product != null),
          promotion: promotionData,
          client_address_id: Number(client_address_id),
        },
      };
    }
    console.log("Original products from request:", JSON.stringify(products?.length));
    console.log(
      "Poster promotion debug:",
      JSON.stringify({
        qualifyingProducts: productsData.filter(
          (product) => product?.promotion_id && !product?.isBonusProduct
        ),
        resultProducts: productsData.filter((product) => product?.isBonusProduct),
        filteredProducts: filterProducts,
        promotionData,
      })
    );
    console.log("posterPayload:", JSON.stringify(posterPayload));
    if (isBotLikeSource(status)) {
      response = await fetchMutation(api.order.put, payload);
    } else if (isBotLikeCreatingSource(status)) {
      const change = await fetchMutation(api.order.patch, {
        ...payload,
        status: "created",
        _id,
      });

      const postToPoster = await postApi({
        ...posterPayload,
        body: {
          ...posterPayload.body,
          comment: JSON.stringify({
            comment,
            order_id: _id,
          }),
        },
      });
      console.log(postToPoster, "postToPoster");

      response = { ...change, ...postToPoster };
    } else {
      const change = await fetchMutation(api.order.put, payload);
      console.log(change);

      const postToPoster = await postApi({
        ...posterPayload,
        body: {
          ...posterPayload.body,
          comment: JSON.stringify({
            comment,
            order_id: change,
          }),
        },
      });

      response = { ...change, ...postToPoster };
    }
    console.log(response);

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(
      JSON.stringify({ error: `Failed to update order: ${error.message}` }),
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    const change = await fetchMutation(api.order.deleteOrder, { _id: id });
    return new Response(
      JSON.stringify({ data: "Order deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return new Response(JSON.stringify({ error: "Failed to delete order" }), {
      status: 500,
    });
  }
}

export async function PATCH(request) {
  try {
    const args = await request.json();
    const change = await fetchMutation(api.order.patch, { ...args });
    return new Response(JSON.stringify({ data: change }), { status: 200 });
  } catch (error) {
    console.error("Error patching order:", error);
    return new Response(JSON.stringify({ error: "Failed to patch order" }), {
      status: 500,
    });
  }
}
