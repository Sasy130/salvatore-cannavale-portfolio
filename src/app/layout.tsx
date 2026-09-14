import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salvatore Cannavale — AI-Assisted Developer",
  description: "Salvatore Cannavale builds practical software, AI-powered applications and automation using modern development tools and AI-assisted workflows.",
  openGraph: {
    title: "Salvatore Cannavale — AI-Assisted Developer",
    description: "Salvatore Cannavale builds practical software, AI-powered applications and automation using modern development tools and AI-assisted workflows.",
    type: "website",
    locale: "en_US",
    siteName: "Salvatore Cannavale",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body></html>;
}
