import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppProviders } from "@/components/providers/AppProviders";
import { ToastContainer } from "@/components/ui/Toast";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
export const metadata: Metadata = {
  title: {
    default: "unexpanse — Smart Expense Tracker",
    template: "%s | unexpanse",
  },
  description:
    "Track your expenses, manage budgets, and gain financial clarity with unexpanse — the premium personal finance tracker.",
  keywords: ["expense tracker", "budget", "personal finance", "money management"],
  authors: [{ name: "unexpanse" }],
  creator: "unexpanse",
  openGraph: {
    type: "website",
    title: "unexpanse — Smart Expense Tracker",
    description: "Premium personal finance tracking.",
    siteName: "unexpanse",
  },
  twitter: {
    card: "summary_large_image",
    title: "unexpanse",
    description: "Premium personal finance tracking.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`min-h-screen bg-background antialiased ${inter.variable} ${jetbrainsMono.variable}`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AppProviders>
              {children}
              <ToastContainer />
            </AppProviders>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
