import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/providers/query-provider";
import { OfflineProvider } from "@/contexts/OfflineContext";
import PWAInstaller from "@/components/pwa/PWAInstaller";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import { initializePaymentGateways } from "@/lib/payment-gateways";
import { I18nProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "@/providers/theme-provider";

export const metadata: Metadata = {
  title: "Restaurant POS - Indian Restaurant Management System",
  description: "Complete POS system for Indian restaurants with GST compliance, UPI payments, and inventory management",
  keywords: ["Restaurant POS", "Indian Restaurant", "GST", "UPI", "Inventory Management", "Order Management"],
  authors: [{ name: "Restaurant POS Team" }],
  openGraph: {
    title: "Restaurant POS System",
    description: "Complete POS system for Indian restaurants",
    url: "https://restaurant-pos.example.com",
    siteName: "Restaurant POS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurant POS System",
    description: "Complete POS system for Indian restaurants",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Restaurant POS",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Restaurant POS",
    "application-name": "Restaurant POS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize payment gateways on the server side
  if (typeof window === 'undefined') {
    initializePaymentGateways()
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className="antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        <OfflineProvider>
          <QueryProvider>
            <I18nProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster />
                <PWAInstaller />
                <ServiceWorkerRegistration />
              </ThemeProvider>
            </I18nProvider>
          </QueryProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}
