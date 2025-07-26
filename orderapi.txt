import { api } from "@/convex/_generated/api";
import { ApiService } from "@/lib/api.services";
import { postApi } from "@/lib/requestApi";
import { fetchMutation, fetchQuery } from "convex/nextjs";

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
    const { response: discount } = await ApiService.getData(
      "clients.getPromotions"
    );
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
      };
    });

    productsData = productsData?.reduce((acc, curr) => {
      const existingProduct = acc.find(
        (product) => +product?.product_id == +curr?.product_id
      );

      if (existingProduct) {
        existingProduct.count += curr.count;
      } else {
        acc.push({ ...curr });
      }

      return acc;
    }, []);

    let filterProducts = productsData.map((p) => {
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
    productsData.forEach((product) => {
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

    const discountProducts = products?.filter((p) => p?.promotion_id);
    let promotion = discount?.reduce((acc, d) => {
      // Find all products related to the current promotion
      const findDiscount = discountProducts?.filter(
        (pr) => +pr?.promotion_id === +d?.promotion_id
      );

      if (findDiscount?.length) {
        acc.push({
          id: +d?.promotion_id,
          involved_products: findDiscount.map((prd) => ({
            id: +prd?.product_id,
            count: +prd?.count,
          })),
        });
      }

      return acc;
    }, []);

    const promotionData = discountProducts.map((prd) => {
      return {
        id: prd.promotion_id,
        involved_products: [
          {
            id: prd?.product_id,
            count: prd?.count,
          },
        ],
      };
    });
    let response;
    let addressData = "";
    console.log({ address });
    if (address) {
      addressData = address;
    } else {
      if (status == "bot" && location.longitude && location.latitude) {
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
    if (status == "bot") {
      response = await fetchMutation(api.order.put, payload);
    } else if (status === "bot-creating") {
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
    console.log(posterPayload);

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
