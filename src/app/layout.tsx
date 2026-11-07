import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { DialogProvider } from "@/components/ui/DialogProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Fitness Tracker",
  description: "Antrenman, beslenme ve kilo takibini yapay zeka destekli koçluk ile birleştiren fitness uygulaması.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // "dark" sınıfı sabittir: uygulama yalnızca koyu temada çalışır (bkz. globals.css)
    <html lang="tr" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-canvas text-white selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <DialogProvider>{children}</DialogProvider>
        </AuthProvider>
        <Toaster theme="dark" richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
