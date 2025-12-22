import { useUser } from "@/hooks/use-user";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Zap } from "lucide-react";

export default function Home() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Mining Rate", value: "1.2/hr", icon: Zap, color: "text-yellow-400" },
    { label: "Network Hash", value: "450 TH", icon: Activity, color: "text-purple-400" },
    { label: "Total Mined", value: "8.4M", icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground overflow-hidden relative">
      {/* Ambient background effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-b-[4rem] blur-3xl -z-10" />
      
      <div className="px-6 pt-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              FORTEX
            </h1>
            <p className="text-muted-foreground text-sm">Welcome back, {user?.username || "Miner"}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold">
              {(user?.username?.[0] || "U").toUpperCase()}
            </div>
          </div>
        </div>

        {/* Main Balance Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel rounded-3xl p-8 mb-8 relative overflow-hidden group"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
          
          <div className="relative z-10">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Balance</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-display font-bold text-white tracking-tight">
                {user?.minedBalance || 0}
              </span>
              <span className="text-xl text-primary font-bold">FTX</span>
            </div>
            <div className="mt-6 flex gap-3">
              <Link href="/mine" className="flex-1">
                <Button className="w-full bg-white text-black hover:bg-gray-200">Start Mining</Button>
              </Link>
              <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                Deposit
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2"
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <div className="text-lg font-bold font-display">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity / Games Teaser */}
        <h2 className="text-lg mb-4 text-white">Quick Games</h2>
        <div className="space-y-4">
          <Link href="/games">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-panel p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Gamepad2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-base text-white">Play & Earn</h3>
                <p className="text-xs text-muted-foreground">Double your earnings with mini-games</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                →
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

import { Gamepad2 } from "lucide-react";
