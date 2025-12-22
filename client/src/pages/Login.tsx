import { useVerify } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { mutate: verify, isPending } = useVerify();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = () => {
    verify(undefined, {
      onSuccess: () => {
        setLocation("/");
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: err.message,
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm h-full bg-primary/10 blur-[80px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <Shield className="w-10 h-10 text-primary" />
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
