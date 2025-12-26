import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";
import fortexLogo from "@assets/photo_2025-10-17_21-00-54_1766418467147.jpg";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async () => {
    if (!MiniKit.isInstalled()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "MiniKit not installed. Please open in World App.",
      });
      return;
    }

    setIsPending(true);

    try {
      const response = await MiniKit.commandsAsync.verify({
        action: "login",
      });

      if (!response.finalPayload) {
        throw new Error("Verification cancelled or failed");
      }

      const res = await fetch("/api/auth-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: response.finalPayload }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Login successful!",
          description: "Welcome to Fortex Arcade!",
        });
        setLocation("/");
      } else {
        throw new Error(data.error || "Backend verification failed");
      }
    } catch (err: any) {
      console.error("Worldcoin login error:", err);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Please try again",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm h-full bg-primary/10 blur-[80px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-40 h-40 rounded-full mx-auto mb-8 shadow-[0_0_40px_rgba(6,182,212,0.4)] overflow-hidden">
          <img src={fortexLogo} alt="FORTEX" className="w-full h-full object-cover" data-testid="img-fortex-logo" />
        </div>

        <h1 className="text-4xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          FORTEX
        </h1>
        <p className="text-muted-foreground mb-12">
          Verify your humanity to start mining tokens and playing games.
        </p>

        <Button
          variant="neon"
          size="lg"
          className="w-full h-14 text-lg"
          onClick={handleLogin}
          disabled={isPending}
          data-testid="button-connect-world-id"
        >
          {isPending ? "Verifying..." : "Connect World ID"}
        </Button>

        <p className="text-xs text-muted-foreground mt-8">
          By connecting, you agree to our Terms of Service.
        </p>
      </motion.div>
    </div>
  );
}
