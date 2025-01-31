import { ApiService } from "@/lib/api.services";

export async function GET(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const spots = url.searchParams.get("spots");

  try {
    if (id) {
      const client = await ApiService.getData(
        `clients.getClient`,
        `&client_id=${id}`
      );
      if (!client) {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          status: 404,
        });
      }
      const clientGroup = await ApiService.getData(
        `clients.getGroup`,
        `&group_id=${client?.response[0]?.client_groups_id}`
      );
      return new Response(
        JSON.stringify({
          client: client.response[0],
          group: clientGroup.response,
        }),
        { status: 200 }
      );
    }
    if (spots) {
      const client = await ApiService.getData(`spots.getSpots`);
      if (!client) {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify(client.response), { status: 200 });
    } else {
      const clients = await ApiService.getData(`access.getEmployees`);
      return new Response(JSON.stringify(clients.response), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch clients" }), {
      status: 500,
    });
  }
}