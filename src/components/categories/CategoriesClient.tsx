"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { CategoryIcon, CATEGORY_ICON_OPTIONS } from "@/components/ui/CategoryIcon";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, Tag } from "@phosphor-icons/react";

const COLOR_OPTIONS = [
  "#F97316", "#3B82F6", "#EC4899", "#8B5CF6", "#10B981",
  "#6366F1", "#F59E0B", "#14B8A6", "#64748B", "#EF4444",
  "#D946EF", "#84CC16", "#0EA5E9", "#22C55E", "#A855F7",
  "#06B6D4", "#F43F5E", "#FB7185", "#78716C", "#94A3B8",
];

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

interface CategoriesClientProps {
  categories: Category[];
}

interface CategoryForm {
  name: string;
  icon: string;
  color: string;
}

export function CategoriesClient({ categories: initial }: CategoriesClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CategoryForm>({ name: "", icon: "tag", color: "#6366F1" });
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditingCat(null);
    setForm({ name: "", icon: "tag", color: "#6366F1" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }

    setIsLoading(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, form);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCat.id ? { ...c, ...form } : c))
        );
        toast.success("Category updated");
      } else {
        const result = await createCategory(form);
        if (result.error) { toast.error("Error", result.error); return; }
        toast.success("Category created");
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
      await deleteCategory(deletingId);
      setCategories((prev) => prev.filter((c) => c.id !== deletingId));
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} leftIcon={<Plus size={16} weight="bold" />} id="create-category-btn">
          New category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-border">
          <EmptyState
            icon={<Tag size={32} className="text-muted-foreground" />}
            title="No categories yet"
            description="Create categories to organize your transactions."
            action={{ label: "Create category", onClick: openCreate, leftIcon: <Plus size={16} weight="bold" /> }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-border/80 hover:shadow-md transition-all duration-200"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${cat.color}20`, color: cat.color }}
              >
                <CategoryIcon name={cat.icon} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cat.name}</p>
                {cat.isDefault && (
                  <p className="text-xs text-muted-foreground">Default</p>
                )}
              </div>
              <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Edit ${cat.name}`}
                >
                  <PencilSimple size={14} />
                </button>
                <button
                  onClick={() => setDeletingId(cat.id)}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCat ? "Edit category" : "New category"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="cat-name"
            label="Name"
            placeholder="e.g. Groceries"
            value={form.name}
            onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }}
            error={error}
          />

          <div>
            <label className="text-sm font-medium block mb-2">Icon</label>
            <div className="grid grid-cols-9 gap-1.5">
              {CATEGORY_ICON_OPTIONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => setForm((f) => ({ ...f, icon: iconName }))}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                    form.icon === iconName
                      ? "bg-foreground text-background"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CategoryIcon name={iconName} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    form.color === color ? "scale-125 ring-2 ring-offset-2 ring-foreground" : "hover:scale-110"
                  }`}
                  style={{ background: color }}
                  aria-label={color}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ background: `${form.color}20`, color: form.color }}
            >
              <CategoryIcon name={form.icon} size={18} />
            </div>
            <span className="text-sm font-medium">{form.name || "Preview"}</span>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              {editingCat ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete category"
        description="Transactions in this category will not be deleted but will become uncategorized."
        confirmLabel="Delete"
        isDestructive
        isLoading={isLoading}
      />
    </div>
  );
}
