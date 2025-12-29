import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Home, LayoutDashboard, Shirt, LogIn, UserPlus, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { to: "/", label: "Home", icon: Home, requiresAuth: true },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
    { to: "/laundry", label: "My Laundry", icon: Shirt, requiresAuth: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Filter nav links based on auth status
  const visibleNavLinks = navLinks.filter((link) => !link.requiresAuth || isAuthenticated);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="Chrita.tn Logo" className="h-10 w-auto transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold text-primary">Chrita.tn</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {visibleNavLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(to)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && <NotificationDropdown />}
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors relative"
                  type="button"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* User Account Dropdown */}
                {isUserMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg overflow-hidden shadow-lg z-50 animate-slide-up">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-border/30">
                        <p className="text-sm font-semibold text-foreground">
                          {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`: 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/account-settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                          type="button"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>

                    {/* Click outside to close */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="outline" size="sm" className="pointer-events-auto cursor-pointer" type="button">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="gradient" size="sm" className="pointer-events-auto cursor-pointer" type="button">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-2">
              {visibleNavLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(to)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <div className="flex gap-2 pt-4 border-t border-border/50 mt-2">
                {isAuthenticated ? (
                  <div className="w-full">
                    <div className="px-4 py-2 mb-2 border-b border-border/30">
                      <p className="text-sm font-semibold text-foreground">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : "User"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                    </div>
                    <Link
                      to="/account-settings"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors rounded-lg"
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </Link>
                    <Button variant="outline" className="w-full mt-2 pointer-events-auto cursor-pointer" onClick={handleLogout} type="button">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/signin" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full pointer-events-auto cursor-pointer" type="button">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="gradient" className="w-full pointer-events-auto cursor-pointer" type="button">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
