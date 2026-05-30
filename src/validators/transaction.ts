import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  description: z.string().min(1, "Description is required").max(500),
  categoryId: z.string().optional(),
  note: z.string().max(1000).optional(),
  paymentMethod: z.string().max(100).optional(),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Invalid date",
  }),
  tags: z.array(z.string()).optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const mobileTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.preprocess(
    (value) => (typeof value === "string" ? parseFloat(value) : value),
    z.number().positive(),
  ),
  description: z.string().min(1, "Description is required").max(500),
  categoryId: z.string().optional(),
  date: z.string().optional(),
});

export type MobileTransactionInput = z.infer<typeof mobileTransactionSchema>;
