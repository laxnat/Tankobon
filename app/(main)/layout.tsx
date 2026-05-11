import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// This layout wraps all "public" pages (home, library, search, etc.) with the
// shared Navbar and Footer. Pages under /dashboard use their own layout instead
// and don't inherit this one — that's the whole point of the route group split.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
