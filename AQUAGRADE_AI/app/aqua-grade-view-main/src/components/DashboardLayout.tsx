import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, History, MessageSquare, Settings, LogOut, Menu, X, BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "History", href: "/history", icon: History },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "Fish Directory", href: "/fish-directory", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-wave">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 transition-transform hover:scale-105"
            >
              <span className="font-bold text-xl text-primary">AquaGrade AI</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "gap-2",
                      isActive && "bg-primary text-primary-foreground font-semibold hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="hidden sm:flex gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card animate-slide-in">
            <nav className="container py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => {
                      navigate(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "bg-primary text-primary-foreground font-semibold hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
};
