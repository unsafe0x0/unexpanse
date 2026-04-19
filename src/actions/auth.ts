"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already registered" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      image: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(name)}`,
    },
  });

  // Create default categories for the user
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      userId: user.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
    })),
  });

  return { success: true, userId: user.id };
}

export async function updateProfile(data: {
  name: string;
  currency: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      name: data.name, 
      currency: data.currency,
      image: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(data.name)}`,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.user.delete({ where: { id: session.user.id } });
  return { success: true };
}
