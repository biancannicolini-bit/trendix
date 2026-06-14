import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Scripvox",
    template: "%s · Scripvox",
  },
  description: "Del trend al guion, en segundos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster
            toastOptions={{
              classNames: {
                toast: "font-[family-name:var(--font-sans)]",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
