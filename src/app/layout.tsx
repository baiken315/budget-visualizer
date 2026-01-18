import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "City Budget Builder - Understand Your Community Contribution",
  description: "Transform abstract municipal budgets into human-scale, understandable narratives. See how your tax dollars support your community.",
  keywords: ["budget", "municipal", "civic", "taxes", "community", "government", "visualization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
