import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPERAI — AI Operations Assistant",
  description: "A working demo that turns operational requests into clear next steps. Built by Salvatore Cannavale.",
};

export default function OperaiLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
