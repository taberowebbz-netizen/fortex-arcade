import { BottomNav } from "@/components/BottomNav";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MousePointer2, Grid3X3, Trophy } from "lucide-react";

const games = [
  {
    id: "clicker",
    title: "Token Clicker",
    description: "Tap as fast as you can to generate entropy and earn tokens.",
    icon: MousePointer2,
    color: "from-cyan-500 to-blue-600",
    href: "/games/clicker"
  },
  {
    id: "memory",
    title: "Memory Matrix",
    description: "Match the patterns to decrypt the block reward.",
    icon: Grid3X3,
    color: "from-purple-500 to-pink-600",
    href: "/games/memory"
  }
];

export default function Games() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12">
        <h1 className="text-3xl mb-2">Arcade</h1>
        <p className="text-muted-foreground mb-8">Play games to earn extra FTX tokens.</p>

        <div className="space-y-6">
          {games.map((game, index) => (
            <Link key={game.id} href={game.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-3xl h-48 cursor-pointer group"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                
                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between border border-white/10 rounded-3xl">
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white shadow-lg`}>
                      <game.icon size={24} />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white flex items-center gap-1 backdrop-blur-md">
                      <Trophy size={12} className="text-yellow-400" /> Win FTX
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                    <p className="text-sm text-gray-300 leading-snug">{game.description}</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
