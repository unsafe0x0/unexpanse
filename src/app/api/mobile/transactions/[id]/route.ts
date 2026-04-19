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
    const { amount, description, type, categoryId, date } = body;

    const transaction = await prisma.transaction.update({
      where: { id: id, userId: String(userId) },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description: description || undefined,
        type: type || undefined,
        categoryId: categoryId || undefined,
        date: date ? new Date(date) : undefined,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
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

    await prisma.transaction.delete({
      where: { id: id, userId: String(userId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
