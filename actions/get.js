"use server";

import { POSTER_API, POSTER_TOKEN } from "@/lib/utils";

export async function getData(urlProps, props) {
  const url = `${POSTER_API}/${urlProps}?${POSTER_TOKEN}${props ? props : ""}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok)
      throw new Error(`Error: ${response.status} - ${response.statusText}`);

    return await response?.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null; // Xatolik bo'lsa, `null` qaytariladi
  }
}
