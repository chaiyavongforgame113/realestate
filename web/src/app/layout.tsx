import type { Metadata, Viewport } from "next";
import { Prompt, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { PageTransition } from "@/components/motion/page-transition";
import { CursorLayer } from "@/components/motion/cursor-layer";
import { CompareProvider } from "@/lib/compare/store";
import { GlobalCompareTray } from "@/components/compare/global-compare-tray";
import { ChatWidget } from "@/components/chat/chat-widget";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { I18nProvider } from "@/lib/i18n/provider";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-prompt",
  display: "swap",
});

const plex = IBM_Plex_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Estate AI — หาบ้านในฝันด้วย AI",
  description:
    "แพลตฟอร์มอสังหาริมทรัพย์ที่ใช้ AI ช่วยค้นหาบ้าน คอนโด ที่ดิน ด้วยภาษาธรรมชาติ เปรียบเทียบและแนะนำทรัพย์ที่ตรงใจคุณที่สุด",
  manifest: "/manifest.webmanifest",
  applicationName: "Estate AI",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Estate AI" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171413" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning className={`${prompt.variable} ${plex.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <CompareProvider>
              <CursorLayer />
              <PageTransition>{children}</PageTransition>
              <GlobalCompareTray />
              <ChatWidget />
              <InstallPrompt />
              <RegisterServiceWorker />
            </CompareProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
