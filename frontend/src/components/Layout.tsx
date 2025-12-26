import { ReactNode } from "react";
import Navbar from "./Navbar";
import heroBg from "@/assets/hero-bg.png";

interface LayoutProps {
  children: ReactNode;
  showBackground?: boolean;
}

const Layout = ({ children, showBackground = false }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      {showBackground ? (
        <div 
          className="min-h-screen pt-16 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background/30 via-background/50 to-background">
            {children}
          </div>
        </div>
      ) : (
        <main className="pt-20">
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;
