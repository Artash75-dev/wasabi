import { revalidatePath } from "next/cache";

export async function POST(req) {
  try {
    // Revalidate the root path ("/")
    revalidatePath("/");
    return new Response(JSON.stringify({ message: "Cache cleared successfully" }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Error clearing cache", error: err.message }), {
      status: 500,
    });
  }
}
