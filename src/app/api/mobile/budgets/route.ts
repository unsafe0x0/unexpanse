import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function POST(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "expanse-tracker-nextjs",
      audience: "expanse-tracker-app",
    });

    const userId = payload.sub;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, amount, categoryId, period } = body;

    const budget = await prisma.budget.create({
      data: {
        userId,
        name,
        amount: parseFloat(amount),
        categoryId: categoryId || undefined,
        period: period || 'monthly',
      },
      include: { category: true }
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 });
  }
}
