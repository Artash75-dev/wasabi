import { ApiService } from "@/lib/api.services";
import { postApi } from "@/lib/requestApi";

export async function GET(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const groupId = url.searchParams.get("groupId");

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
    if (groupId) {
      const client = await ApiService.getData(`clients.getGroups`);
      if (!client) {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify(client.response), { status: 200 });
    } else {
      const clients = await ApiService.getData(`clients.getClients`);
      return new Response(JSON.stringify(clients.response), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch clients" }), {
      status: 500,
    });
  }
}
export async function DELETE(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    if (id) {
      const client = await postApi({
        url: `clients.removeClient`,
        body: {
          client_id: Number(id),
        },
      });
      return new Response(JSON.stringify(client), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch clients" }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const args = await request.json();
    console.log(args);

    const {
      client_groups_id,
      client_name,
      client_sex,
      phone,
      birthday,
      address,
      location,
      comment,
    } = args;

    try {
      const client = await postApi({
        url: `clients.createClient`,
        body: {
          client_name,
          client_sex: Number(client_sex),
          client_groups_id_client: Number(client_groups_id),
          phone,
          birthday,
          address,
          addresses: [
            {
              address1: address,
              lat: location.latitude,
              lng: location.longitude,
            },
          ],
          comment,
        },
      });
      console.log(client);
      return new Response(JSON.stringify({ ...client }), { status: 200 });
    } catch (error) {
      console.log(error);
      return new Response(JSON.stringify({ ...error }), { status: 500 });
    }
  } catch (error) {
    console.error("Error updating order:");
    return new Response(
      JSON.stringify({ error: `Failed to update order + ${error}` }),
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    try {
      const args = await request.json();
      console.log(args);

      const {
        client_groups_id,
        client_name,
        client_sex,
        phone,
        birthday,
        address,
        location,
        comment,
      } = args;

      try {
        const client = await postApi({
          url: `clients.updateClient`,
          body: {
            client_id: id,
            client_name,
            client_sex: Number(client_sex),
            client_groups_id_client: Number(client_groups_id),
            phone,
            birthday,
            address,
            addresses: [
              {
                address1: address,
                lat: location.latitude,
                lng: location.longitude,
              },
            ],
            comment,
          },
        });
        console.log(client);
        return new Response(JSON.stringify({ ...client }), { status: 200 });
      } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ ...error }), { status: 500 });
      }
    } catch (error) {
      console.error("Error updating order:");
      return new Response(
        JSON.stringify({ error: `Failed to update order + ${error}` }),
        {
          status: 500,
        }
      );
    }
  } else {
    return new Response(JSON.stringify({ error: "Client ID is required" }), {
      status: 400,
    });
  }
}
