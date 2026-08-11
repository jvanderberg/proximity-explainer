import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jvanderberg.github.io/proximity-explainer/"),
  title: "Do Apartments Hurt Home Values? Oak Park Already Ran the Experiment.",
  description:
    "A visual walk through every house and every multi-family building in Oak Park, Illinois, and what the data says about apartments and property values.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Do apartments hurt home values? Oak Park already ran the experiment.",
    description:
      "Houses next to mid-block apartment buildings are worth the same as identical houses two blocks away. A scroll-through of the data and the method.",
    url: "/",
    siteName: "Oak Park, Explained",
    type: "website",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "Do apartments hurt home values? Oak Park already ran the experiment." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Do apartments hurt home values? Oak Park already ran the experiment.",
    description:
      "Houses next to mid-block apartment buildings are worth the same as identical houses two blocks away. A scroll-through of the data and the method.",
    images: ["og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
