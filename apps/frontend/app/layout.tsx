import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Delego",
  description: "Delegate shopping to AI agents with spending controls",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
