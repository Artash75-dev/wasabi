import { unstable_cache } from "next/cache";

import { toAdminProductSummaries } from "@/lib/posterProducts";
import { POSTER_API, POSTER_TOKEN } from "@/lib/utils";

export const getCachedAdminProducts = unstable_cache(
  async () => {
    const response = await fetch(
      `${POSTER_API}/menu.getProducts?${POSTER_TOKEN}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Poster products");
    }

    const products = await response.json();
    return toAdminProductSummaries(products?.response);
  },
  ["poster-admin-products"],
  { revalidate: 3600, tags: ["products"] }
);
