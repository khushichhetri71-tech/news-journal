import type { Metadata } from "next";
import { Caveat, Patrick_Hand } from "next/font/google";
import Analytics from "@/components/Analytics";
import "./globals.css";

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  weight: "400",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Apple Times 🍎",
  description:
    "A daily news digest — national, international, sports and defence, a few lines each.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${patrickHand.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
