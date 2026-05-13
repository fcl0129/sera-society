import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Props = {
  children: ReactNode;
  hideChrome?: boolean;
};

export default function MktLayout({ children, hideChrome = false }: Props) {
  return (
    <div style={{ background: "var(--mkt-navy)", color: "var(--mkt-cream)", minHeight: "100vh" }}>
      {!hideChrome && <Navbar />}
      <main id="main-content">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}
