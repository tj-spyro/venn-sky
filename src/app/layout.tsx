import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Venn Sky - Blue Sky Follower Overlap",
  description: "Visualize the overlap of followers or following between Blue Sky users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
