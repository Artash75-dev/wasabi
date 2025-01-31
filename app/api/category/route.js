import { ApiService } from "@/lib/api.services";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const category = await ApiService.getData(
        "menu.getCategory",
        `&category_id=${id}`
      );
      return Response.json({ data: category.response });
    } else {
      const category = await ApiService.getData("menu.getCategories");
      return Response.json({ data: category.response });
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch category" }), {
      status: 500,
    });
  }
}
