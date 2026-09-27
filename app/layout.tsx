import type { Metadata } from "next";
import { TrpcProvider } from "@/lib/TrpcProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CounselConnect",
  description: "Intake & Counsellor Ops Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
