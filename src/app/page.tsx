import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ChartBar, Target, Wallet, ArrowRight } from "@/components/ui/Icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "unexpanse — Smart Expense Tracker",
};

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            unexpanse
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="mb-8 inline-block">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-foreground border border-border">
            Track smarter, spend wisely
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          Smart expense tracking
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Understand your spending patterns. Set budgets that work. Build
          lasting financial habits.
          <br /> All in one beautiful, minimal interface.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Start tracking free
            <ArrowRight size={16} className="ml-2" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <ChartBar size={24} weight="duotone" />,
              title: "Beautiful Analytics",
              description:
                "See your spending patterns at a glance with clean, intuitive charts and insights.",
            },
            {
              icon: <Target size={24} weight="duotone" />,
              title: "Smart Budgets",
              description:
                "Set budgets by category and stay on track with intelligent alerts and tracking.",
            },
            {
              icon: <Wallet size={24} weight="duotone" />,
              title: "Full Control",
              description:
                "Export data, manage categories, track income & expenses, organize with tags.",
            },
          ].map((feature, idx) => (
            <div key={idx} className="group">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center border-t border-border">
        <h2 className="text-4xl font-bold mb-4">
          Ready to transform your finances?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join thousands tracking their spending smarter with unexpanse.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 text-base font-medium hover:bg-primary/90 transition-colors"
        >
          Start free now
          <ArrowRight size={18} className="ml-2" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold mb-1">unexpanse</h3>
              <p className="text-sm text-muted-foreground">
                Smart expense tracking
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-xs text-muted-foreground text-center">
            <p>&copy; 2026 unexpanse</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
