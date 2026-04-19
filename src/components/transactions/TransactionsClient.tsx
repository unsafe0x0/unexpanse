"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { TransactionModal } from "./TransactionModal";
import { useToast } from "@/components/ui/Toast";
import { deleteTransaction, deleteTransactions } from "@/actions/transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Plus,
  MagnifyingGlass,
  Trash,
  PencilSimple,
  ArrowsLeftRight,
  ArrowsDownUp,
  CaretUp,
  CaretDown,
  Circle,
} from "@phosphor-icons/react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: Date;
  paymentMethod?: string | null;
  note?: string | null;
  tags: string[];
  categoryId?: string | null;
  category?: { id: string; name: string; icon: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface TransactionsClientProps {
  initialTransactions: Transaction[];
  categories: Category[];
  currency: string;
}

type SortField = "date" | "amount" | "description";
type SortOrder = "asc" | "desc";

export function TransactionsClient({
  initialTransactions,
  categories,
  currency,
}: TransactionsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const selectAll = (ids: string[]) => setSelectedIds(ids);
  const clearSelection = () => setSelectedIds([]);

  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fmt = (n: number) => formatCurrency(n, currency);

  const filtered = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchSearch =
          !search ||
          tx.description.toLowerCase().includes(search.toLowerCase()) ||
          tx.note?.toLowerCase().includes(search.toLowerCase());
        const matchType = !filterType || tx.type === filterType;
        const matchCategory =
          !filterCategory || tx.categoryId === filterCategory;
        return matchSearch && matchType && matchCategory;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortField === "amount") cmp = a.amount - b.amount;
        if (sortField === "description") cmp = a.description.localeCompare(b.description);
        return sortOrder === "asc" ? cmp : -cmp;
      });
  }, [transactions, search, filterType, filterCategory, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortOrder("desc"); }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowsDownUp size={14} className="opacity-40" />;
    return sortOrder === "asc" ? <CaretUp size={14} /> : <CaretDown size={14} />;
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deletingId);
      setTransactions((prev) => prev.filter((t) => t.id !== deletingId));
      toast.success("Transaction deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTransactions(selectedIds);
      setTransactions((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
      toast.success(`${selectedIds.length} transactions deleted`);
      clearSelection();
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
      setBulkDeleteOpen(false);
    }
  };

  const typeOptions = [
    { value: "", label: "All types" },
    { value: "EXPENSE", label: "Expense" },
    { value: "INCOME", label: "Income" },
  ];

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name,
      icon: <CategoryIcon name={c.icon} size={14} />,
    })),
  ];

  const allIds = filtered.map((t) => t.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  return (
    <div className="space-y-4">

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          id="tx-search"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<MagnifyingGlass size={16} />}
          className="sm:w-72"
        />
        <div className="flex gap-2 items-center flex-1">
          <Select
            id="tx-filter-type"
            options={typeOptions}
            value={filterType}
            onChange={setFilterType}
            className="min-w-35 w-auto shrink-0"
          />
          <Select
            id="tx-filter-category"
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
            className="min-w-44 w-auto shrink-0"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              leftIcon={<Trash size={14} />}
            >
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => { setEditingTx(null); setModalOpen(true); }}
            leftIcon={<Plus size={14} weight="bold" />}
            id="add-transaction-btn"
          >
            Add
          </Button>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{filtered.length} transactions</span>
          <Circle weight="fill" size={5} className="opacity-40" />
          <span className="text-emerald-500 font-medium">
            +{fmt(filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0))}
          </span>
          <Circle weight="fill" size={5} className="opacity-40" />
          <span className="text-red-500 font-medium">
            -{fmt(filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0))}
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border">
          <EmptyState
            icon={<ArrowsLeftRight size={32} className="text-muted-foreground" />}
            title={search || filterType || filterCategory ? "No results found" : "No transactions yet"}
            description={
              search || filterType || filterCategory
                ? "Try adjusting your search or filters."
                : "Add your first transaction to start tracking."
            }
            action={
              !search && !filterType && !filterCategory
                ? {
                    label: "Add transaction",
                    onClick: () => setModalOpen(true),
                    leftIcon: <Plus size={16} weight="bold" />,
                  }
                : undefined
            }
            size="sm"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">

          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => allSelected ? clearSelection() : selectAll(allIds)}
              className="h-4 w-4 rounded"
              aria-label="Select all"
            />
            <button
              onClick={() => handleSort("description")}
              className="flex items-center gap-1 text-left hover:text-foreground transition-colors"
            >
              Description {renderSortIcon("description")}
            </button>
            <span>Category</span>
            <button
              onClick={() => handleSort("date")}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Date {renderSortIcon("date")}
            </button>
            <span>Method</span>
            <button
              onClick={() => handleSort("amount")}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Amount {renderSortIcon("amount")}
            </button>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className={cn(
                  "group flex md:grid md:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3",
                  "hover:bg-accent/40 transition-colors",
                  selectedIds.includes(tx.id) && "bg-accent/60"
                )}
              >

                <input
                  type="checkbox"
                  checked={selectedIds.includes(tx.id)}
                  onChange={() => toggleSelect(tx.id)}
                  className="h-4 w-4 rounded shrink-0"
                  aria-label={`Select ${tx.description}`}
                />

                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{
                      background: tx.category?.color ? `${tx.category.color}20` : "var(--accent)",
                      color: tx.category?.color ?? "var(--muted-foreground)",
                    }}
                  >
                    {tx.category?.icon
                      ? <CategoryIcon name={tx.category.icon} size={18} />
                      : <ArrowsLeftRight size={18} className="text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    {tx.note && (
                      <p className="text-xs text-muted-foreground truncate">{tx.note}</p>
                    )}
                  </div>
                </div>

                <div className="hidden md:block">
                  {tx.category ? (
                    <Badge variant="secondary" size="sm">
                      {tx.category.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                <span className="hidden md:block text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(tx.date)}
                </span>

                <span className="hidden md:block text-xs text-muted-foreground">
                  {tx.paymentMethod ?? "—"}
                </span>

                <div className="flex items-center gap-2 ml-auto md:ml-0">
                  <span
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap",
                      tx.type === "INCOME" ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {fmt(tx.amount)}
                  </span>

                  <div className="flex items-center gap-1 max-w-0 overflow-hidden opacity-0 group-hover:max-w-16 group-hover:opacity-100 transition-all duration-200 ease-out pointer-events-none group-hover:pointer-events-auto">
                    <button
                      onClick={() => { setEditingTx(tx); setModalOpen(true); }}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Edit"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingId(tx.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TransactionModal
        key={modalOpen ? (editingTx?.id || "new") : "closed"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        categories={categories}
        initialData={
          editingTx
            ? {
                id: editingTx.id,
                type: editingTx.type,
                amount: editingTx.amount,
                description: editingTx.description,
                categoryId: editingTx.categoryId ?? undefined,
                note: editingTx.note ?? undefined,
                paymentMethod: editingTx.paymentMethod ?? undefined,
                date: new Date(editingTx.date).toISOString().split("T")[0],
              }
            : undefined
        }
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete transaction"
        description="This action cannot be undone. The transaction will be permanently removed."
        confirmLabel="Delete"
        isDestructive
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.length} transactions`}
        description="This will permanently delete all selected transactions. This cannot be undone."
        confirmLabel={`Delete ${selectedIds.length} transactions`}
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
}
