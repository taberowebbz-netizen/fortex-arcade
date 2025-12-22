import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useClaimMining } from "@/hooks/use-mining";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CoinFlipGame() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null);
  const [prediction, setPrediction] = useState<"heads" | "tails" | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const { mutate: claim } = useClaimMining();
  const { toast } = useToast();
  const betAmount = 10;

  const flipCoin = () => {
    if (isFlipping || !prediction) return;
    
    setIsFlipping(true);
    setLastWin(null);
    
    setTimeout(() => {
      const result = Math.random() < 0.5 ? "heads" : "tails";
      setCoinResult(result);
      
      const won = prediction === result;
      setLastWin(won);
      
      if (won) {
        const reward = betAmount * 2;
        claim(reward, {
          onSuccess: () => {
            toast({
              title: "You Won!",
              description: `Coin landed on ${result}. You earned ${reward} FTX tokens!`,
            });
          }
        });
      } else {
        toast({
          variant: "destructive",
          title: "You Lost!",
          description: `Coin landed on ${result}. Better luck next time!`,
        });
      }
      
      setIsFlipping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link href="/games">
        <div className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-colors z-20">
          <ArrowLeft className="text-white" />
        </div>
      </Link>

      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-display font-bold mb-2">Coin Flip</h1>
        <p className="text-muted-foreground">Pick heads or tails to double your bet!</p>
      </div>

      <motion.div
        className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.4)] border-4 border-amber-300/50"
        animate={isFlipping ? { 
          rotateY: [0, 180, 360, 540, 720, 900, 1080],
          y: [0, -100, 0, -80, 0, -60, 0]
        } : {}}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <span className="text-4xl font-bold text-amber-900">
          {coinResult === "heads" ? "H" : coinResult === "tails" ? "T" : "?"}
        </span>
      </motion.div>

      {lastWin !== null && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center mb-6"
        >
          <div className={`text-2xl font-bold ${lastWin ? "text-green-400" : "text-red-400"}`}>
            {lastWin ? "You Won!" : "You Lost!"}
          </div>
          <div className="text-sm text-muted-foreground capitalize">
            Coin landed on {coinResult}
          </div>
        </motion.div>
      )}

      <div className="flex gap-4 mb-8">
        <Button
          size="lg"
          variant={prediction === "heads" ? "default" : "outline"}
          onClick={() => setPrediction("heads")}
          disabled={isFlipping}
          className="h-14 px-8 text-lg font-bold rounded-2xl"
          data-testid="button-predict-heads"
        >
          Heads
        </Button>
        <Button
          size="lg"
          variant={prediction === "tails" ? "default" : "outline"}
          onClick={() => setPrediction("tails")}
          disabled={isFlipping}
          className="h-14 px-8 text-lg font-bold rounded-2xl"
          data-testid="button-predict-tails"
        >
          Tails
        </Button>
      </div>

      <Button
        size="lg"
        onClick={flipCoin}
        disabled={isFlipping || !prediction}
        className="h-14 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600"
        data-testid="button-flip-coin"
      >
        {isFlipping ? "Flipping..." : `Flip Coin (${betAmount} FTX)`}
      </Button>
    </div>
  );
}
