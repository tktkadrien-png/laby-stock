import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { DataProvider } from "@/contexts/DataContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AlertPopup from "@/components/alerts/AlertPopup";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LABY STOCK - Gestion de Stock Professionnel",
  description: "Système professionnel de gestion de stock pour laboratoire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider>
          <SettingsProvider>
            <DataProvider>
              <AlertProvider>
                <div className="flex h-screen overflow-hidden">
                  {/* Sidebar */}
                  <Sidebar />

                  {/* Main content area */}
                  <div className="flex-1 flex flex-col lg:ml-64">
                    {/* Header */}
                    <Header />

                    {/* Page content */}
                    <main className="flex-1 overflow-y-auto p-6">
                      {children}
                    </main>
                  </div>
                </div>

                {/* Alert Popup */}
                <AlertPopup />
              </AlertProvider>
            </DataProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
