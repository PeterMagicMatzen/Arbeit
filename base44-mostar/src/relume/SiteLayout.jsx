import { Outlet } from "react-router-dom";
import { Navbar7 } from "@/relume/components/navbar-07";
import { Footer7 } from "@/relume/components/footer-07";
import "@/relume/relume.css";

export default function SiteLayout() {
  return (
    <div className="relume-site scheme-1 min-h-screen">
      <Navbar7 />
      <Outlet />
      <Footer7 />
    </div>
  );
}
