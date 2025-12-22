import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useClaimMining } from "@/hooks/use-mining";
import { motion } from "framer-motion";
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_PLAYS = 3;
const COOLDOWN_HOURS = 12;
const GAME_KEY = "dice_game_data";

function getGameData() {
  const data = localStorage.getItem(GAME_KEY);
  if (!data) return { playsLeft: MAX_PLAYS, lastReset: Date.now() };
  return JSON.parse(data);
}

function saveGameData(playsLeft: number, lastReset: number) {
  localStorage.setItem(GAME_KEY, JSON.stringify({ playsLeft, lastReset }));
}

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function DiceGame() {
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<"high" | "low" | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [playsLeft, setPlaysLeft] = useState(MAX_PLAYS);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const { mutate: claim } = useClaimMining();
  const { toast } = useToast();
  const betAmount = 10;

  useEffect(() => {
    const data = getGameData();
    const timeSinceReset = Date.now() - data.lastReset;
    const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
    
    if (timeSinceReset >= cooldownMs) {
      setPlaysLeft(MAX_PLAYS);
      saveGameData(MAX_PLAYS, Date.now());
      setCooldownEnd(null);
    } else if (data.playsLeft <= 0) {
      setPlaysLeft(0);
      setCooldownEnd(data.lastReset + cooldownMs);
    } else {
      setPlaysLeft(data.playsLeft);
    }
  }, []);

  useEffect(() => {
    if (cooldownEnd) {
      const interval = setInterval(() => {
        if (Date.now() >= cooldownEnd) {
          setPlaysLeft(MAX_PLAYS);
          saveGameData(MAX_PLAYS, Date.now());
          setCooldownEnd(null);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownEnd]);

  const formatTimeLeft = () => {
    if (!cooldownEnd) return "";
    const ms = cooldownEnd - Date.now();
    if (ms <= 0) return "";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const rollDice = () => {
    if (isRolling || !prediction) return;
    
    if (playsLeft <= 0) {
      toast({
        variant: "destructive",
        title: "No plays left!",
        description: `Wait ${formatTimeLeft()} to play again.`,
      });
      return;
    }
    
    const newPlaysLeft = playsLeft - 1;
    setPlaysLeft(newPlaysLeft);
    const data = getGameData();
    saveGameData(newPlaysLeft, newPlaysLeft === 0 ? Date.now() : data.lastReset);
    if (newPlaysLeft === 0) {
      setCooldownEnd(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000);
    }
    
    setIsRolling(true);
    setLastWin(null);
    
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceResult(result);
      
      const isHigh = result >= 4;
      const won = (prediction === "high" && isHigh) || (prediction === "low" && !isHigh);
      setLastWin(won);
      
      if (won) {
        const reward = betAmount * 2;
        claim(reward, {
          onSuccess: () => {
            toast({
              title: "You Won!",
              description: `Dice rolled ${result}. You earned ${reward} FTX tokens!`,
            });
          }
        });
      } else {
        toast({
          variant: "destructive",
          title: "You Lost!",
          description: `Dice rolled ${result}. Better luck next time!`,
        });
      }
      
      setIsRolling(false);
    }, 1500);
  };

  const DiceIcon = diceResult ? diceIcons[diceResult - 1] : Dice5;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link href="/games">
        <div className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-colors z-20">
          <ArrowLeft className="text-white" />
        </div>
      </Link>

      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-display font-bold mb-2">Dice Roll</h1>
        <p className="text-muted-foreground">Predict high (4-6) or low (1-3) to win 2x!</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Plays left:</span>
          <span className={`font-bold ${playsLeft > 0 ? "text-green-400" : "text-red-400"}`}>{playsLeft}/{MAX_PLAYS}</span>
          {cooldownEnd && (
            <span className="flex items-center gap-1 text-yellow-400">
              <Clock size={14} />
              {formatTimeLeft()}
            </span>
          )}
        </div>
      </div>

      <motion.div
        className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)]"
        animate={isRolling ? { 
          rotateX: [0, 360, 720, 1080],
          rotateY: [0, 360, 720, 1080]
        } : {}}
        transition={{ duration: 1.5 }}
      >
        <DiceIcon className="w-20 h-20 text-white" />
      </motion.div>

      {lastWin !== null && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-2xl font-bold mb-6 ${lastWin ? "text-green-400" : "text-red-400"}`}
        >
          {lastWin ? "You Won!" : "You Lost!"}
        </motion.div>
      )}

      <div className="flex gap-4 mb-8">
        <Button
          size="lg"
          variant={prediction === "low" ? "default" : "outline"}
          onClick={() => setPrediction("low")}
          disabled={isRolling}
          className="h-14 px-8 text-lg font-bold rounded-2xl"
          data-testid="button-predict-low"
        >
          Low (1-3)
        </Button>
        <Button
          size="lg"
          variant={prediction === "high" ? "default" : "outline"}
          onClick={() => setPrediction("high")}
          disabled={isRolling}
          className="h-14 px-8 text-lg font-bold rounded-2xl"
          data-testid="button-predict-high"
        >
          High (4-6)
        </Button>
      </div>

      <Button
        size="lg"
        onClick={rollDice}
        disabled={isRolling || !prediction || playsLeft <= 0}
        className="h-14 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600"
        data-testid="button-roll-dice"
      >
        {playsLeft <= 0 ? `Wait ${formatTimeLeft()}` : isRolling ? "Rolling..." : `Roll Dice (${betAmount} FTX)`}
      </Button>
    </div>
  );
}
