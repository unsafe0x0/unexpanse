"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { updateProfile, deleteAccount } from "@/actions/auth";
import { CURRENCIES } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { UserCircle, Palette, Trash, Sun, Moon, Desktop, Minus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  currency: string;
  image: string | null;
  createdAt: Date;
}

export function SettingsClient({
  user,
}: {
  user: UserData;
}) {
  const { theme, setTheme } = useTheme();
  const { update: updateSession } = useSession();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    currency: user?.currency ?? "INR",
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setIsLoading(true);
    try {
      const result = await updateProfile(form);
      if (result.error) toast.error("Error", result.error);
      else {
        await updateSession(); // force JWT to re-fetch currency from DB
        toast.success("Profile updated");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await signOut({ callbackUrl: "/auth/login" });
    } catch {
      toast.error("Failed to delete account");
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.symbol} ${c.name} (${c.code})`,
  }));

  const themeOptions = [
    { value: "light",  label: "Light",  icon: <Sun     size={16} /> },
    { value: "dark",   label: "Dark",   icon: <Moon    size={16} /> },
    { value: "system", label: "System", icon: <Desktop size={16} /> },
  ];

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <UserCircle size={16} className="text-muted-foreground" />
            </div>
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">

            <div className="flex items-center gap-4 pb-2">
              <div className="relative flex h-14 w-14 overflow-hidden items-center justify-center rounded-full bg-foreground text-background">
                <Image
                  src={user?.image || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(form.name || "User")}`}
                  alt={form.name || "Avatar"}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : <Minus size={12} />}
                </p>
              </div>
            </div>

            <Input
              id="settings-name"
              label="Display name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              id="settings-email"
              label="Email"
              value={user?.email ?? ""}
              disabled
              hint="Email cannot be changed"
            />
            <Select
              id="settings-currency"
              label="Default currency"
              options={currencyOptions}
              value={form.currency}
              onChange={(v) => setForm((f) => ({ ...f, currency: v }))}
            />
            <Button type="submit" isLoading={isLoading} id="save-profile-btn">
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Palette size={16} className="text-muted-foreground" />
            </div>
            <CardTitle>Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Select your preferred color theme
          </p>
          <div className="flex gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                id={`theme-${opt.value}`}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                  mounted && theme === opt.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <Trash size={16} className="text-destructive" />
            </div>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all data. Cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              id="delete-account-btn"
            >
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account"
        description="This will permanently delete your account, all transactions, categories, and budgets. This action cannot be undone."
        confirmLabel="Yes, delete my account"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
}
