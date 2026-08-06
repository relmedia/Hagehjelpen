import type { Metadata } from "next";
import { Inter, Outfit, Sarpanch } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { HashScroll } from "@/components/HashScroll";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

// Erstatning for Serpentine Bold (kommersiell font) – Sarpanch er inspirert av den
const sarpanch = Sarpanch({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "Hagehjelpen – Plen og hagetjenester",
  description:
    "Få en perfekt plen uten anstrengelse. Hagehjelpen leverer og installerer elektriske robotgressklippere for huseiere og bedrifter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${inter.variable} ${outfit.variable} ${sarpanch.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Markerer at JS er aktivt slik at GSAP-elementer kan starte skjult uten å ødelegge no-JS-opplevelsen */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        {children}
        <HashScroll />
        <Analytics />
      </body>
    </html>
  );
}
