"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format"),
});

export async function getCategories() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(data: {
  name: string;
  icon: string;
  color: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = CategorySchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input data" };

  await prisma.category.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function updateCategory(id: string, data: {
  name: string;
  icon: string;
  color: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = CategorySchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input data" };

  await prisma.category.updateMany({
    where: { id, userId: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Unlink transactions first
  await prisma.transaction.updateMany({
    where: { categoryId: id, userId: session.user.id },
    data: { categoryId: null },
  });

  await prisma.category.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard/categories");
  return { success: true };
}
