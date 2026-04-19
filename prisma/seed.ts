import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@unexpanse.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@unexpanse.com",
      password: hashedPassword,
      currency: "USD",
    },
  });

  console.log(`User: ${user.email}`);



  // Create categories
  const existingCats = await prisma.category.findMany({ where: { userId: user.id } });
  if (existingCats.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      })),
    });
    console.log(`Created ${DEFAULT_CATEGORIES.length} categories`);
  }

  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // Generate sample transactions (last 6 months)
  const now = new Date();
  const transactions = [];

  for (let month = 5; month >= 0; month--) {
    const d = new Date(now.getFullYear(), now.getMonth() - month, 1);

    // Income
    transactions.push({
      userId: user.id,
      type: "INCOME" as const,
      amount: 4500 + Math.random() * 1000,
      description: "Monthly Salary",
      categoryId: catMap["Salary"],
      paymentMethod: "Bank Transfer",
      date: new Date(d.getFullYear(), d.getMonth(), 1),
      tags: ["recurring"],
    });

    // Expenses
    const expenses = [
      { desc: "Grocery shopping", cat: "Food & Dining", min: 80, max: 200 },
      { desc: "Netflix subscription", cat: "Entertainment", min: 15, max: 20 },
      { desc: "Uber ride", cat: "Transportation", min: 10, max: 40 },
      { desc: "Coffee shop", cat: "Food & Dining", min: 5, max: 30 },
      { desc: "Gym membership", cat: "Fitness", min: 30, max: 60 },
      { desc: "Electric bill", cat: "Utilities", min: 60, max: 120 },
      { desc: "Online shopping", cat: "Shopping", min: 50, max: 300 },
      { desc: "Restaurant dinner", cat: "Food & Dining", min: 40, max: 120 },
    ];

    for (const exp of expenses) {
      const day = Math.floor(Math.random() * 27) + 1;
      transactions.push({
        userId: user.id,
        type: "EXPENSE" as const,
        amount: exp.min + Math.random() * (exp.max - exp.min),
        description: exp.desc,
        categoryId: catMap[exp.cat] || null,
        paymentMethod: ["Credit Card", "Debit Card", "Cash"][Math.floor(Math.random() * 3)],
        date: new Date(d.getFullYear(), d.getMonth(), day),
        tags: [],
      });
    }
  }

  // Clear existing transactions
  await prisma.transaction.deleteMany({ where: { userId: user.id } });

  // Create transactions
  await prisma.transaction.createMany({ data: transactions });
  console.log(`Created ${transactions.length} transactions`);

  // Create budgets
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        name: "Food & Dining",
        amount: 500,
        categoryId: catMap["Food & Dining"],
        period: "monthly",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      {
        userId: user.id,
        name: "Entertainment",
        amount: 100,
        categoryId: catMap["Entertainment"],
        period: "monthly",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      {
        userId: user.id,
        name: "Transportation",
        amount: 150,
        categoryId: catMap["Transportation"],
        period: "monthly",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      {
        userId: user.id,
        name: "Shopping",
        amount: 300,
        categoryId: catMap["Shopping"],
        period: "monthly",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    ],
  });
  console.log("Created budgets");

  console.log("\nSeed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
