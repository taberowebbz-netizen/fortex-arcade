import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useClaimMining } from "@/hooks/use-mining";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ICONS = ["A", "B", "C", "D", "E", "F"];
const MAX_PLAYS = 3;
const COOLDOWN_HOURS = 12;
const GAME_KEY = "memory_game_data";

function getGameData() {
  const data = localStorage.getItem(GAME_KEY);
  if (!data) return { playsLeft: MAX_PLAYS, lastReset: Date.now() };
  return JSON.parse(data);
}

function saveGameData(playsLeft: number, lastReset: number) {
  localStorage.setItem(GAME_KEY, JSON.stringify({ playsLeft, lastReset }));
}

export default function MemoryGame() {
  const [cards, setCards] = useState<{id: number, icon: string, flipped: boolean, matched: boolean}[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [playsLeft, setPlaysLeft] = useState(MAX_PLAYS);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const { mutate: claim } = useClaimMining();
  const { toast } = useToast();

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

  const initializeGame = () => {
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
    
    const shuffled = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        flipped: false,
        matched: false
      }));
    setCards(shuffled);
    setFlipped([]);
    setMatches(0);
    setGameStarted(true);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].icon === cards[second].icon) {
        setCards(prev => prev.map((card, i) => 
          i === first || i === second ? { ...card, matched: true } : card
        ));
        setMatches(m => m + 1);
        setFlipped([]);
      } else {
        const timer = setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            i === first || i === second ? { ...card, flipped: false } : card
          ));
          setFlipped([]);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (matches === ICONS.length && gameStarted) {
      const reward = 100;
      claim(reward, {
        onSuccess: () => {
          toast({
            title: "Memory Matched!",
            description: `You decrypted the block! Earned ${reward} FTX.`,
          });
          setGameStarted(false);
        }
      });
    }
  }, [matches, gameStarted, claim, toast]);

  const handleCardClick = (index: number) => {
    if (flipped.length < 2 && !cards[index].flipped && !cards[index].matched) {
      setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
      setFlipped(prev => [...prev, index]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 relative">
      <Link href="/games">
        <div className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-colors z-20">
          <ArrowLeft className="text-white" />
        </div>
      </Link>

      <div className="text-center mb-8 mt-12">
        <h1 className="text-3xl font-display font-bold mb-2">Memory Matrix</h1>
        <p className="text-muted-foreground">Match symbols to decrypt.</p>
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

      {!gameStarted ? (
        <div className="flex-1 flex items-center justify-center">
          <Button 
            onClick={initializeGame} 
            size="lg" 
            disabled={playsLeft <= 0}
            className="bg-purple-600 hover:bg-purple-700 h-16 px-8 text-xl"
          >
            <Brain className="mr-2" /> {playsLeft <= 0 ? `Wait ${formatTimeLeft()}` : "Start Decryption"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="aspect-square relative cursor-pointer perspective-1000"
              onClick={() => handleCardClick(index)}
            >
              <div className={cn(
                "w-full h-full rounded-xl flex items-center justify-center text-3xl shadow-lg border transition-all duration-300",
                (card.flipped || card.matched) 
                  ? "bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                  : "bg-white/5 border-white/10 hover:border-white/30"
              )}>
                <div style={{ transform: "rotateY(180deg)" }} className={(card.flipped || card.matched) ? "block" : "hidden"}>
                  {card.icon}
                </div>
                <div className={(!card.flipped && !card.matched) ? "block" : "hidden"}>
                  ❓
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
