import { ApiService } from "@/lib/api.services";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const branches = await ApiService.getData("spots.getSpots");
      return Response.json({ data: branches.response });
    } else {
      const branches = await ApiService.getData("spots.getSpots");
      return Response.json({ data: branches.response });
    }
  } catch (error) {
    console.error("Error fetching branches:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch branches" }), {
      status: 500,
    });
  }
}
