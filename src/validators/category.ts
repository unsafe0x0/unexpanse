import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
