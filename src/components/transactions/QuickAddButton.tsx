"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { TransactionModal } from "./TransactionModal";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function QuickAddButton({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        id="quick-add-transaction"
        onClick={() => setOpen(true)}
        leftIcon={<Plus size={16} weight="bold" />}
      >
        Add Transaction
      </Button>
      <TransactionModal
        isOpen={open}
        onClose={() => setOpen(false)}
        categories={categories}
      />
    </>
  );
}
