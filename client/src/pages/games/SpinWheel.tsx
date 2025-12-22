import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useClaimMining } from "@/hooks/use-mining";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_PLAYS = 3;
const COOLDOWN_HOURS = 12;
const GAME_KEY = "spinwheel_game_data";

function getGameData() {
  const data = localStorage.getItem(GAME_KEY);
  if (!data) return { playsLeft: MAX_PLAYS, lastReset: Date.now() };
  return JSON.parse(data);
}

function saveGameData(playsLeft: number, lastReset: number) {
  localStorage.setItem(GAME_KEY, JSON.stringify({ playsLeft, lastReset }));
}

const prizes = [
  { value: 1, label: "1x", color: "#ef4444" },
  { value: 2, label: "2x", color: "#f97316" },
  { value: 5, label: "5x", color: "#eab308" },
  { value: 10, label: "10x", color: "#22c55e" },
  { value: 2, label: "2x", color: "#3b82f6" },
  { value: 1, label: "1x", color: "#8b5cf6" },
  { value: 50, label: "50x", color: "#ec4899" },
  { value: 3, label: "3x", color: "#06b6d4" },
];

export default function SpinWheelGame() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
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

  const spin = () => {
    if (isSpinning) return;
    
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
    
    setIsSpinning(true);
    setResult(null);
    
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[randomIndex];
    const segmentAngle = 360 / prizes.length;
    const targetRotation = rotation + 360 * 5 + (randomIndex * segmentAngle) + (segmentAngle / 2);
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setResult(prize.value);
      const reward = betAmount * prize.value;
      claim(reward, {
        onSuccess: () => {
          toast({
            title: `You won ${prize.label}!`,
            description: `You earned ${reward} FTX tokens!`,
          });
        }
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link href="/games">
        <div className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-colors z-20">
          <ArrowLeft className="text-white" />
        </div>
      </Link>

      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-display font-bold mb-2">Spin Wheel</h1>
        <p className="text-muted-foreground">Spin to win up to 50x!</p>
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

      <div className="relative w-72 h-72 mb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white z-20" />
        
        <motion.div
          className="w-full h-full rounded-full border-4 border-white/20 shadow-[0_0_50px_rgba(234,179,8,0.3)] overflow-hidden"
          style={{ rotate: rotation }}
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {prizes.map((prize, i) => {
              const angle = (360 / prizes.length) * i;
              const startAngle = (angle - 90) * (Math.PI / 180);
              const endAngle = (angle + 360 / prizes.length - 90) * (Math.PI / 180);
              const x1 = 50 + 50 * Math.cos(startAngle);
              const y1 = 50 + 50 * Math.sin(startAngle);
              const x2 = 50 + 50 * Math.cos(endAngle);
              const y2 = 50 + 50 * Math.sin(endAngle);
              const largeArc = 360 / prizes.length > 180 ? 1 : 0;
              
              return (
                <g key={i}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                  />
                  <text
                    x={50 + 30 * Math.cos((startAngle + endAngle) / 2)}
                    y={50 + 30 * Math.sin((startAngle + endAngle) / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {prize.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

      {result !== null && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center mb-6"
        >
          <div className="text-4xl font-bold text-yellow-400">{result}x</div>
          <div className="text-sm text-muted-foreground">You won {betAmount * result} FTX!</div>
        </motion.div>
      )}

      <Button
        size="lg"
        onClick={spin}
        disabled={isSpinning || playsLeft <= 0}
        className="h-14 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600"
        data-testid="button-spin"
      >
        {playsLeft <= 0 ? `Wait ${formatTimeLeft()}` : isSpinning ? "Spinning..." : `Spin (${betAmount} FTX)`}
      </Button>
    </div>
  );
}
