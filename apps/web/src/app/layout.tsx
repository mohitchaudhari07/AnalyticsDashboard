import "./globals.css";
import SidebarLayout from "@/components/ui/SidebarLayout";

export const metadata = {
  title: "Analytics Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
