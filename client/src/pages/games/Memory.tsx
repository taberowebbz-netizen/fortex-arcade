import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useClaimMining } from "@/hooks/use-mining";
import { motion } from "framer-motion";
import { ArrowLeft, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ICONS = ["💎", "⚡", "🔮", "🧬", "⛓️", "🛡️"];

export default function MemoryGame() {
  const [cards, setCards] = useState<{id: number, icon: string, flipped: boolean, matched: boolean}[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const { mutate: claim } = useClaimMining();
  const { toast } = useToast();

  const initializeGame = () => {
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
      </div>

      {!gameStarted ? (
        <div className="flex-1 flex items-center justify-center">
          <Button onClick={initializeGame} size="lg" className="bg-purple-600 hover:bg-purple-700 h-16 px-8 text-xl">
            <Brain className="mr-2" /> Start Decryption
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
