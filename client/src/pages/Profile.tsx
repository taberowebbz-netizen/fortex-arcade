import { useUser } from "@/hooks/use-user";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Wallet, Settings, LogOut } from "lucide-react";
import { useMiniKit } from "@/hooks/use-minikit";

export default function Profile() {
  const { data: user } = useUser();
  const { isInstalled } = useMiniKit();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover Image */}
      <div className="h-48 w-full bg-gradient-to-b from-primary/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
      </div>

      <div className="px-6 -mt-16 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border-4 border-background bg-slate-800 flex items-center justify-center text-4xl shadow-xl">
            {(user?.username?.[0] || "U").toUpperCase()}
          </div>
          
          <h1 className="text-2xl font-bold mt-4">{user?.username || "Anonymous Miner"}</h1>
          <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            <ShieldCheck size={14} />
            <span className="text-xs font-bold uppercase tracking-wide">
              {isInstalled ? "World ID Verified" : "Web Preview"}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Wallet size={20} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
                <div className="text-xl font-bold text-white">{user?.minedBalance || 0} FTX</div>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              Withdraw
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="text-muted-foreground" size={20} />
                <span>Settings</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors text-red-400">
              <div className="flex items-center gap-3">
                <LogOut size={20} />
                <span>Disconnect Wallet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
