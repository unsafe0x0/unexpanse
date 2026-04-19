import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChartBar, Target, Wallet } from "@/components/ui/Icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "unexpanse — Smart Expense Tracker",
};

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between h-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-lg">unexpanse</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Now with AI-powered insights
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Your finances,{" "}
          <span className="bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">beautifully tracked.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          unexpanse is the premium personal finance tracker that helps you understand
          your spending, set smart budgets, and build lasting financial habits.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 rounded-xl bg-foreground text-background px-6 py-3 text-sm font-semibold hover:bg-foreground/90 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            Start for free
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-accent transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <ChartBar size={20} weight="duotone" />,
              title: "Smart Analytics",
              desc: "Beautiful charts showing your spending patterns, trends, and category breakdowns.",
            },
            {
              icon: <Target size={20} weight="duotone" />,
              title: "Budget Goals",
              desc: "Set monthly budgets by category and get alerted before you overspend.",
            },
            {
              icon: <Wallet size={20} weight="duotone" />,
              title: "Full Control",
              desc: "Track income, expenses, filter by tags, export data, and manage categories.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take control?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who track their finances with unexpanse.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-8 py-3.5 font-semibold hover:bg-foreground/90 transition-all hover:-translate-y-0.5"
          >
            Create free account
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © unexpanse. Built for financial clarity.
      </footer>
    </div>
  );
}
