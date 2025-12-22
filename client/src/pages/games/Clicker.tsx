import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useClaimMining } from "@/hooks/use-mining";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClickerGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { mutate: claim } = useClaimMining();
  const { toast } = useToast();

  useEffect(() => {
    if (!isPlaying) return;

    if (timeLeft <= 0) {
      setIsPlaying(false);
      setGameOver(true);
      const reward = Math.floor(score / 2); // 2 clicks = 1 token
      claim(reward, {
        onSuccess: () => {
          toast({
            title: "Game Over!",
            description: `You earned ${reward} FTX tokens!`,
          });
        }
      });
      return;
    }

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, claim, toast]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setIsPlaying(true);
    setGameOver(false);
  };

  const handleClick = () => {
    if (isPlaying) {
      setScore(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link href="/games">
        <div className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-colors z-20">
          <ArrowLeft className="text-white" />
        </div>
      </Link>

      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-3xl font-display font-bold mb-2">Token Clicker</h1>
        <p className="text-muted-foreground">Tap fast to generate tokens!</p>
      </div>

      <div className="w-full max-w-sm aspect-square relative flex items-center justify-center mb-12">
        <AnimatePresence>
          {isPlaying ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleClick}
              className="w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center z-10 border-4 border-white/20"
            >
              <Zap className="w-16 h-16 text-white mb-2 fill-white" />
              <span className="text-3xl font-bold text-white">{score}</span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              {gameOver && (
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white mb-2">{score}</div>
                  <div className="text-sm text-cyan-400">CLICKS RECORDED</div>
                </div>
              )}
              <Button size="lg" onClick={startGame} className="h-16 px-8 text-xl font-bold rounded-2xl">
                {gameOver ? "Play Again" : "Start Game"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 font-mono text-xl tracking-widest text-muted-foreground">
        TIME: <span className={timeLeft < 4 ? "text-red-500" : "text-white"}>00:{timeLeft.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
}
