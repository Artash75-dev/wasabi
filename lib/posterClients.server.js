import { unstable_cache } from "next/cache";

import { ApiService } from "@/lib/api.services";

export const getCachedClientGroups = unstable_cache(
  async () => {
    const groups = await ApiService.getData("clients.getGroups");
    return groups?.response || [];
  },
  ["poster-client-groups"],
  { revalidate: 3600 }
);
