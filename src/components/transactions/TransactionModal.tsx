"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import { PAYMENT_METHODS } from "@/lib/constants";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface TransactionData {
  id?: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  categoryId?: string;
  note?: string;
  paymentMethod?: string;
  date: string;
  tags?: string[];
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialData?: TransactionData;
}

export function TransactionModal({
  isOpen,
  onClose,
  categories,
  initialData,
}: TransactionModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    initialData?.type ?? "EXPENSE"
  );
  const [form, setForm] = useState({
    amount: initialData?.amount?.toString() ?? "",
    description: initialData?.description ?? "",
    categoryId: initialData?.categoryId ?? "",
    note: initialData?.note ?? "",
    paymentMethod: initialData?.paymentMethod ?? "",
    date: initialData?.date ?? new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!initialData?.id;



  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.amount || isNaN(parseFloat(form.amount)))
      newErrors.amount = "Valid amount required";
    else if (parseFloat(form.amount) <= 0)
      newErrors.amount = "Amount must be positive";
    if (!form.description.trim()) newErrors.description = "Description required";
    if (!form.date) newErrors.date = "Date required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = {
        type,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        categoryId: form.categoryId || undefined,
        note: form.note.trim() || undefined,
        paymentMethod: form.paymentMethod || undefined,
        date: form.date,
      };

      const result = isEditing
        ? await updateTransaction(initialData.id!, data)
        : await createTransaction(data);

      if (result?.error) {
        toast.error("Error", result.error);
      } else {
        toast.success(
          isEditing ? "Transaction updated" : "Transaction added",
          isEditing ? "Changes saved successfully." : `${type === "INCOME" ? "Income" : "Expense"} recorded.`
        );
        onClose();
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
    icon: <CategoryIcon name={c.icon} size={14} />,
  }));

  const paymentOptions = PAYMENT_METHODS.map((m) => ({ value: m, label: m }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Transaction" : "Add Transaction"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <Tabs
          items={[
            { value: "EXPENSE", label: "Expense" },
            { value: "INCOME", label: "Income" },
          ]}
          value={type}
          onChange={(v) => setType(v as "INCOME" | "EXPENSE")}
          variant="default"
        />

        <Input
          id="tx-amount"
          label="Amount"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          error={errors.amount}
          leftIcon={
            <span className="text-xs font-medium text-muted-foreground">$</span>
          }
        />

        <Input
          id="tx-description"
          label="Description"
          placeholder="What was this for?"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          error={errors.description}
        />

        <div className="grid grid-cols-2 gap-3">

          <Select
            id="tx-category"
            label="Category"
            options={categoryOptions}
            value={form.categoryId}
            onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            placeholder="Select category"
          />

          <DatePicker
            id="tx-date"
            label="Date"
            value={form.date}
            onChange={(dateStr) => setForm((f) => ({ ...f, date: dateStr }))}
            error={errors.date}
          />
        </div>

        <Select
          id="tx-payment"
          label="Payment method"
          options={paymentOptions}
          value={form.paymentMethod}
          onChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}
          placeholder="Select method"
        />

        <Textarea
          id="tx-note"
          label="Note (optional)"
          placeholder="Add a note..."
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          rows={2}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={isLoading}
            id="tx-submit"
          >
            {isEditing ? "Save changes" : `Add ${type === "INCOME" ? "income" : "expense"}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
