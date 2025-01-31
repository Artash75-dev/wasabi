import { postApi } from "@/lib/requestApi";

export async function PATCH(request) {
  const args = await request.json();
  try {
    const {
      spot_tablet_id,
      spot_id,
      transaction_id,
      courier_id,
      processing_status,
    } = args;
    const postToPoster = await postApi({
      url: `transactions.updateTransaction`,
      body: {
        spot_id,
        transaction_id,
        courier_id,
        processing_status,
        spot_tablet_id,
      },
    });
    return new Response(JSON.stringify({ data: postToPoster }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error patching order:", error);
    return new Response(JSON.stringify({ error: "Failed to patch order" }), {
      status: 500,
    });
  }
}
