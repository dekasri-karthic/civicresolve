import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CivicResolve | AI-Powered Civic Grievance Platform",
  description:
    "Report civic issues like potholes, broken lights, and garbage. Gemini AI automatically categorizes, prioritizes, and routes them to the right municipal department.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              <strong className="text-teal-700">CivicResolve</strong> — Report. Track. Resolve.
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Built by Dekasri Karthic
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
