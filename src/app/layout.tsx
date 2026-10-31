import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMMI Sales CRM",
  description: "Mobile-first sales follow-up and reporting workspace for EMMI",
  icons: {
    icon: "/emmi-logo.png",
    apple: "/emmi-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#7b1e3a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-khmer antialiased">{children}</body>
    </html>
  );
}
