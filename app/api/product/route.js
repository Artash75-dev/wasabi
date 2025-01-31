import { ApiService } from "@/lib/api.services";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const categoryId = url.searchParams.get("categoryId");

    if (id) {
      const product = await ApiService.getData(
        "menu.getProduct",
        `&product_id=${id}`
      );
      return Response.json({ data: product.response });
    } else if (categoryId) {
      const products = await ApiService.getData(
        "menu.getProducts",
        `&category_id=${categoryId}`
      );
      return Response.json({ data: products.response });
    } else {
      const products = await ApiService.getData("menu.getProducts");
      return Response.json({ data: products.response });
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch category" }), {
      status: 500,
    });
  }
}
