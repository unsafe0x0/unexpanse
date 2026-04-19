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

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
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

    const budget = await prisma.budget.update({
      where: { id: id, userId: String(userId) },
      data: {
        name: name || undefined,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        categoryId: categoryId || undefined,
        period: period || undefined,
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
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

    await prisma.budget.delete({
      where: { id: id, userId: String(userId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}
