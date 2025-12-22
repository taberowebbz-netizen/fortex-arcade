import { useState } from "react";
import React from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { MiningTimer } from "@/components/MiningTimer";
import { useClaimMining } from "@/hooks/use-mining";
import { useUser } from "@/hooks/use-user";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Hammer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Mine() {
  const { data: user } = useUser();
  const { mutate: claim, isPending: isClaiming } = useClaimMining();
  const [isMining, setIsMining] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [secondsUntilMine, setSecondsUntilMine] = useState<number | null>(null);
  const { toast } = useToast();

  const MINING_DURATION = 10; // 10 seconds for demo

  // Check if user can mine based on nextMineTime
  const canStartMining = !secondsUntilMine || secondsUntilMine <= 0;

  const handleStartMining = () => {
    setIsMining(true);
    setCanClaim(false);
  };

  const handleMiningComplete = () => {
    setIsMining(false);
    setCanClaim(true);
    toast({
      title: "Mining Complete!",
      description: "Claim your tokens now.",
    });
  };

  const handleClaim = () => {
    claim(50, { // Claim 50 tokens
      onSuccess: (data) => {
        setCanClaim(false);
        // Set the next mine time from the server response
        if (data.nextMineTime) {
          const nextTime = new Date(data.nextMineTime);
          const now = new Date();
          const secondsLeft = Math.ceil((nextTime.getTime() - now.getTime()) / 1000);
          setSecondsUntilMine(secondsLeft);
        }
        toast({
          title: "Tokens Claimed!",
          description: `You received 50 FTX. New balance: ${data.newBalance}. Next mining in 24 hours.`,
        });
      },
      onError: (error: any) => {
        // Check if error is due to cooldown
        if (error.secondsUntilMine !== undefined) {
          setSecondsUntilMine(error.secondsUntilMine);
        }
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not claim tokens. Try again.",
        });
      }
    });
  };

  // Initialize cooldown on user load
  React.useEffect(() => {
    if (user?.nextMineTime) {
      const nextTime = new Date(user.nextMineTime);
      const now = new Date();
      const secondsLeft = Math.ceil((nextTime.getTime() - now.getTime()) / 1000);
      if (secondsLeft > 0) {
        setSecondsUntilMine(secondsLeft);
      } else {
        setSecondsUntilMine(null);
      }
    }
  }, [user?.nextMineTime]);

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="px-6 pt-12 flex flex-col items-center min-h-[80vh]">
        <h1 className="text-2xl mb-8">Cloud Mining Node</h1>

        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {secondsUntilMine && secondsUntilMine > 0 ? (
            <MiningTimer 
              durationSeconds={secondsUntilMine} 
              isActive={true} 
              onComplete={() => setSecondsUntilMine(null)}
              isCooldown={true}
            />
          ) : (
            <MiningTimer 
              durationSeconds={MINING_DURATION} 
              isActive={isMining} 
              onComplete={handleMiningComplete}
              isCooldown={false}
            />
          )}

          <div className="mt-12 w-full max-w-xs space-y-4">
            <AnimatePresence mode="wait">
              {!isMining && !canClaim && canStartMining && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <Button 
                    variant="neon" 
                    size="lg" 
                    className="w-full h-16 text-lg relative overflow-hidden group"
                    onClick={handleStartMining}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Hammer className="w-5 h-5" /> Start Mining Sequence
                    </span>
                    <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </motion.div>
              )}

              {!canStartMining && !isMining && !canClaim && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full text-center"
                >
                  <p className="text-muted-foreground text-sm mb-4">
                    Mining on cooldown. Come back in {secondsUntilMine} seconds
                  </p>
                  <Button disabled size="lg" className="w-full h-16 text-lg opacity-50">
                    <Hammer className="w-5 h-5 mr-2" /> Cooldown Active
                  </Button>
                </motion.div>
              )}

              {isMining && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <p className="text-primary animate-pulse font-mono tracking-widest">
                    HASHING BLOCKS...
                  </p>
                </motion.div>
              )}

              {canClaim && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full h-16 text-lg bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    onClick={handleClaim}
                    disabled={isClaiming}
                  >
                    {isClaiming ? (
                      "Claiming..."
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6" /> Claim 50 FTX
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats footer */}
        <div className="w-full grid grid-cols-2 gap-4 mt-8">
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-xs text-muted-foreground uppercase">Rate</div>
            <div className="text-xl font-display font-bold text-white">50 <span className="text-xs font-normal">FTX/cycle</span></div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-xs text-muted-foreground uppercase">Balance</div>
            <div className="text-xl font-display font-bold text-primary">{user?.minedBalance || 0}</div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
