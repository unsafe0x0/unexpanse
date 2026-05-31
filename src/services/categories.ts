import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { CategoryInput } from "@/validators/category";
import { cache } from "react";

export const getCategoriesForUser = cache(async (userId: string) => {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
});

export async function ensureDefaultCategoriesForUser(userId: string) {
  let categories = await getCategoriesForUser(userId);

  if (categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      })),
    });

    categories = await getCategoriesForUser(userId);
  }

  return categories;
}

export async function createCategoryForUser(
  userId: string,
  data: CategoryInput,
) {
  return prisma.category.create({
    data: { ...data, userId },
  });
}

export async function updateCategoryForUser(
  userId: string,
  id: string,
  data: CategoryInput,
) {
  return prisma.category.updateMany({
    where: { id, userId },
    data,
  });
}

export async function deleteCategoryForUser(userId: string, id: string) {
  await prisma.transaction.updateMany({
    where: { categoryId: id, userId },
    data: { categoryId: null },
  });

  return prisma.category.deleteMany({
    where: { id, userId },
  });
}
