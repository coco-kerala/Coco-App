import { Plus_Jakarta_Sans, Fredoka } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const brand = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata = {
  title: "KeraGo — Coconut care",
  description: "Book coconut tree care near you. Simple for homes and partners.",
  applicationName: "KeraGo",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "KeraGo" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport = {
  themeColor: "#3A7D2E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${brand.variable} font-sans antialiased`}>
        <AuthProvider>
          <DemoSwitcher />
          {children}
          <ServiceWorkerRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
