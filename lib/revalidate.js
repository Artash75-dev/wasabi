"use server"

import { revalidateTag } from "next/cache"

export async function revalidatePath(data) {
    revalidateTag(data)
}   