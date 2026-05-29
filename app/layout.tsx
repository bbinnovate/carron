import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "./components/SmoothScroll";

import {
  Familjen_Grotesk,
} from "next/font/google";

import "./globals.css";

// ALRO FONT

const alro = localFont({
  src: [
    {
      path: "../public/fonts/alro-alro-regular-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/alro-alro-regular-400.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-alro",
});

// FAMILJEN GROTESK

const familjenGrotesk =
  Familjen_Grotesk({
    subsets: ["latin"],
    variable: "--font-familjen",
  });

export const metadata: Metadata = {
  title: "Carron Clothing",
  description: "AI Product Generator",

  icons: {
    icon: "/fav.avif",
    shortcut: "/fav.avif",
    apple: "/fav.avif",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (

    <html
      lang="en"
      className={`
        ${alro.variable}
        ${familjenGrotesk.variable}
      `}
    >

      <body>

         <SmoothScroll>
          {children}
        </SmoothScroll>


      </body>

    </html>
  );
}