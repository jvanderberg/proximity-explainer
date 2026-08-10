import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jvanderberg.github.io/proximity-explainer/"),
  title: "Do Apartments Hurt Home Values? Oak Park Checked.",
  description:
    "A visual walk through every house and every multi-family building in Oak Park, Illinois — and what the data says about apartments and property values.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Do apartments hurt home values? Oak Park checked.",
    description:
      "Houses next to mid-block apartment buildings are worth the same as identical houses two blocks away. A scroll-through of the data and the method.",
    url: "/",
    siteName: "Oak Park, Explained",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Do apartments hurt home values? Oak Park checked.",
    description:
      "Houses next to mid-block apartment buildings are worth the same as identical houses two blocks away. A scroll-through of the data and the method.",
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
