import "./globals.css";
import SiteChrome from "@/components/SiteChrome/SiteChrome";

export const metadata = {
  title: "Griflan Labs — Crafting Brands That Hit Hard",
  description:
    "Griflan Labs is a branding, web and motion studio. Fly over the floor of our work and open a project to see the full story.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}