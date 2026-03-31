import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "var(--navbar-height)" }}>
        {children}
      </main>
      <Footer />
      <ThemeToggle />
    </>
  );
}
