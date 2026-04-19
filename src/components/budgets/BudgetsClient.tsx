"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { createBudget, updateBudget, deleteBudget } from "@/actions/budgets";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Plus, PencilSimple, Trash, Target, Warning } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  period: string;
  categoryId: string | null;
  category: Category | null;
}

interface BudgetsClientProps {
  budgets: Budget[];
  categories: Category[];
  spending: Record<string, number>;
  currency?: string;
}

export function BudgetsClient({ budgets: initial, categories, spending, currency = "USD" }: BudgetsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    categoryId: "",
    period: "monthly",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setEditingBudget(null);
    setForm({ name: "", amount: "", categoryId: "", period: "monthly" });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setForm({
      name: budget.name,
      amount: budget.amount.toString(),
      categoryId: budget.categoryId ?? "",
      period: budget.period,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name required";
    if (!form.amount || isNaN(parseFloat(form.amount))) newErrors.amount = "Valid amount required";
    else if (parseFloat(form.amount) <= 0) newErrors.amount = "Amount must be positive";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = {
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        categoryId: form.categoryId || undefined,
        period: form.period,
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, data);
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === editingBudget.id ? { 
              ...b, 
              ...data, 
              categoryId: data.categoryId || null,
              category: categories.find(c => c.id === data.categoryId) || null
            } : b
          )
        );
        toast.success("Budget updated");
      } else {
        await createBudget(data);
        toast.success("Budget created");
        router.refresh();
      }
      setModalOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    try {
      await deleteBudget(deletingId);
      setBudgets((prev) => prev.filter((b) => b.id !== deletingId));
      toast.success("Budget deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsLoading(false);
      setDeletingId(null);
    }
  };

  const fmt = (n: number) => formatCurrency(n, currency);

  const categoryOptions = [
    { value: "", label: "All expenses" },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name,
      icon: <CategoryIcon name={c.icon} size={14} />,
    })),
  ];

  const periodOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "weekly", label: "Weekly" },
    { value: "yearly", label: "Yearly" },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />} id="create-budget-btn">
          New budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="rounded-xl border border-border">
          <EmptyState
            icon={<Target className="h-8 w-8 text-muted-foreground" />}
            title="No budgets yet"
            description="Create budgets to keep your spending in check."
            action={{ label: "Create budget", onClick: openCreate, leftIcon: <Plus className="h-4 w-4" /> }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const spent = spending[budget.id] ?? 0;
            const isOver = spent > budget.amount;
            const remaining = budget.amount - spent;

            return (
              <div
                key={budget.id}
                className={cn(
                  "group rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md",
                  isOver ? "border-red-500/40" : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    {budget.category && (
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-base"
                        style={{ background: `${budget.category.color}20` }}
                      >
                        <CategoryIcon name={budget.category.icon} size={18} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{budget.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" size="sm">
                          {budget.period}
                        </Badge>
                        {budget.category && (
                          <Badge variant="secondary" size="sm">
                            {budget.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={() => openEdit(budget)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingId(budget.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                <Trash size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <Progress
                    value={spent}
                    max={budget.amount}
                    showLabel
                    size="default"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {fmt(spent)} spent
                    </span>
                    <span className={cn(isOver ? "text-red-500 font-medium" : "text-muted-foreground")}>
                      {isOver ? `${fmt(Math.abs(remaining))} over` : `${fmt(remaining)} left`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{fmt(budget.amount)}</span>
                  {isOver && (
                    <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                      <Warning size={14} />
                      Over budget
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBudget ? "Edit budget" : "New budget"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="budget-name"
            label="Budget name"
            placeholder="e.g. Monthly groceries"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />
          <Input
            id="budget-amount"
            label="Budget amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            error={errors.amount}
            leftIcon={<span className="text-xs text-muted-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0).find(p => p.type === 'currency')?.value || '$'}</span>}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="budget-category"
              label="Category (optional)"
              options={categoryOptions}
              value={form.categoryId}
              onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              placeholder="All expenses"
            />
            <Select
              id="budget-period"
              label="Period"
              options={periodOptions}
              value={form.period}
              onChange={(v) => setForm((f) => ({ ...f, period: v }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              {editingBudget ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete budget"
        description="This budget will be permanently deleted."
        confirmLabel="Delete"
        isDestructive
        isLoading={isLoading}
      />
    </div>
  );
}
