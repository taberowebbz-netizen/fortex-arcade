import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MiniKitProvider } from "@/hooks/use-minikit";
import { useUser } from "@/hooks/use-user";

import Home from "@/pages/Home";
import Mine from "@/pages/Mine";
import Games from "@/pages/Games";
import Profile from "@/pages/Profile";
import ClickerGame from "@/pages/games/Clicker";
import MemoryGame from "@/pages/games/Memory";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { data: user, isLoading, isError } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // If we're done loading and have no user, redirect to login
    // In a real app, strict checks would be here. 
    // For this demo, we allow access if useUser returns null initially 
    // but typically you'd block rendering until auth check is complete.
    if (!isLoading && !user && location !== "/login") {
       setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) return <div className="min-h-screen bg-background" />; // Or a spinner
  
  // If user exists, render component
  return user ? <Component {...rest} /> : null; 
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/mine">
        <ProtectedRoute component={Mine} />
      </Route>
      <Route path="/games">
        <ProtectedRoute component={Games} />
      </Route>
      <Route path="/games/clicker">
        <ProtectedRoute component={ClickerGame} />
      </Route>
      <Route path="/games/memory">
        <ProtectedRoute component={MemoryGame} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MiniKitProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </MiniKitProvider>
    </QueryClientProvider>
  );
}

export default App;
