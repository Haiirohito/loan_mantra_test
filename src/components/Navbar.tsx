import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calculator, Home, Phone, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 w-full relative">
          <Link to="/" className="flex items-center space-x-2 shrink-0 md:w-48">
            <img src={logo} alt="LoanMantrra" className="h-16 w-auto -mt-1" />
            <span className="font-bold text-xl text-foreground">LoanMantrra</span>
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            <Link to="/">
              <Button
                variant={isActive("/") ? "secondary" : "ghost"}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <Link to="/calculators">
              <Button
                variant={isActive("/calculators") ? "secondary" : "ghost"}
                className="flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Calculators
              </Button>
            </Link>
            <Link to="/loans">
              <Button
                variant={isActive("/loans") ? "secondary" : "ghost"}
                className="flex items-center gap-2"
              >
                <Landmark className="w-4 h-4" />
                Loans
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant={isActive("/contact") ? "secondary" : "ghost"}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Contact
              </Button>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:w-48 justify-end">
            <div className="hidden md:flex gap-2">
              <Button asChild variant="default" size="sm">
                <Link to="/loans">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center space-x-1 ml-2">
            <Link to="/">
              <Button
                variant={isActive("/") ? "secondary" : "ghost"}
                size="icon"
              >
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/calculators">
              <Button
                variant={isActive("/calculators") ? "secondary" : "ghost"}
                size="icon"
              >
                <Calculator className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/loans">
              <Button
                variant={isActive("/loans") ? "secondary" : "ghost"}
                size="icon"
              >
                <Landmark className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant={isActive("/contact") ? "secondary" : "ghost"}
                size="icon"
              >
                <Phone className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
