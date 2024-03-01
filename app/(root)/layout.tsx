import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="root">
      <NextTopLoader
        color="#5c43ff"
        showSpinner={false}
      />
      <Sidebar />
      <MobileNav />

      <div className="root-container">
        <div className="wrapper">{children}</div>
      </div>

      <Toaster />
    </main>
  );
};

export default Layout;
