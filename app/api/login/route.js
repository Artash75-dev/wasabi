import { api } from "@/convex/_generated/api";
import { ApiService } from "@/lib/api.services";
import { fetchQuery } from "convex/nextjs";

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const { login, password } = await request.json();

    let responseData;

    if (role === "admin") {
      responseData = await fetchQuery(api.admin.post, { login, password });
      if (!responseData) {
        return new Response(
          JSON.stringify({ error: "Failed to update order" }),
          { status: 404 }
        );
      }
    } else if (role === "delivery") {
      const { response: deliveries } = await ApiService.getData(
        "access.getEmployees"
      );
      const findDeliver = deliveries.find(
        (c) => c.login === login && c.role_id == 11
      );
      console.log(deliveries);

      if (!findDeliver) {
        return new Response(
          JSON.stringify({ error: "Failed to update order" }),
          { status: 404 }
        );
      }
      responseData = { ...findDeliver, role: "delivery" };
    } else {
      return new Response(JSON.stringify({ error: "Invalid role specified" }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(
      JSON.stringify({ error: `Failed to update order: ${error.message}` }),
      { status: 500 }
    );
  }
}
