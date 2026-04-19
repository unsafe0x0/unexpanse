import type { Metadata } from "next";
import { Lightning, ChartBar, Target } from "@/components/ui/Icons";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border relative overflow-hidden flex-col">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <span className="text-xl font-bold tracking-tight">unexpanse</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6 max-w-sm">
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Your finances,
                  <br />
                  beautifully tracked.
                </h1>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Take control of your spending, set smart budgets, and visualize
                  your financial health — all in one elegant dashboard.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: <ChartBar size={16} weight="duotone" />, label: "Smart analytics & reports" },
                  { icon: <Target   size={16} weight="duotone" />, label: "Budget tracking & alerts" },
                  { icon: <Lightning size={16} weight="duotone" />, label: "Real-time expense logging" },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-foreground">
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            © unexpanse. Built for financial clarity.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="font-bold">unexpanse</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
