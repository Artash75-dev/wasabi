import { ApiService } from "@/lib/api.services";
import { getCachedAdminProducts } from "@/lib/posterProducts.server";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const categoryId = url.searchParams.get("categoryId");
    const ids = url.searchParams.get("ids");

    if (id) {
      const product = await ApiService.getData(
        "menu.getProduct",
        `&product_id=${id}`
      );
      return Response.json({ data: product.response });
    } else {
      const products = await getCachedAdminProducts();

      if (ids) {
        const requestedIds = new Set(
          ids.split(",").map((productId) => Number(productId))
        );
        return Response.json({
          data: products.filter((product) =>
            requestedIds.has(Number(product.product_id))
          ),
        });
      }

      if (categoryId) {
        return Response.json({
          data: products.filter(
            (product) =>
              Number(product.menu_category_id) === Number(categoryId)
          ),
        });
      }

      return Response.json({
        data: products,
      });
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch category" }), {
      status: 500,
    });
  }
}
