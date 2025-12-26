import { Link, useLocation } from "wouter";
import { Home, Pickaxe, Gamepad2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/mine", icon: Pickaxe, label: "Mine" },
    { href: "/games", icon: Gamepad2, label: "Games" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-background/80 backdrop-blur-xl border-t border-white/10">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 cursor-pointer",
                  isActive 
                    ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                    : "text-muted-foreground hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-transform duration-300",
                    isActive && "animate-pulse"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
