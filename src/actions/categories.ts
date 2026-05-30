"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createCategoryForUser,
  deleteCategoryForUser,
  getCategoriesForUser,
  updateCategoryForUser,
} from "@/services/categories";
import { categorySchema } from "@/validators/category";

export async function getCategories() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return getCategoriesForUser(session.user.id);
}

export async function createCategory(data: {
  name: string;
  icon: string;
  color: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input data" };
  await createCategoryForUser(session.user.id, parsed.data);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    icon: string;
    color: string;
  },
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input data" };
  await updateCategoryForUser(session.user.id, id, parsed.data);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await deleteCategoryForUser(session.user.id, id);

  revalidatePath("/dashboard");
  return { success: true };
}
