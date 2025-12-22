import { useUser } from "@/hooks/use-user";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Zap, Crown, Star, X, Wallet as WalletIcon, Copy, Check, Lock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: user, isLoading, refetch } = useUser();
  const { toast } = useToast();
  const [selectedMembership, setSelectedMembership] = useState<string>(user?.membership || "free");
  const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [stakingAmount, setStakingAmount] = useState("");
  const [stakingDuration, setStakingDuration] = useState("30");
  const [isStaking, setIsStaking] = useState(false);

  const mockWalletAddress = "0x" + user?.worldId?.substring(0, 40) || "0x1234567890abcdef";
  const mockWalletBalance = 250.5;
  const mockStakedAmount = 1000;

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

  const memberships = [
    { id: "vip", name: "VIP", bonus: 50, price: 10, color: "from-blue-500 to-cyan-500", icon: Star },
    { id: "silver", name: "Silver", bonus: 75, price: 20, color: "from-slate-400 to-slate-500", icon: Star },
    { id: "gold", name: "Gold", bonus: 100, price: 30, color: "from-yellow-500 to-orange-500", icon: Crown },
    { id: "platinum", name: "Platinum", bonus: 150, price: 50, color: "from-purple-500 to-pink-500", icon: Crown },
  ];

  const handleMembershipUpdate = async (membershipId: string) => {
    setIsUpdatingMembership(true);
    try {
      const res = await fetch(`/api/membership/${membershipId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update membership");
      
      setSelectedMembership(membershipId);
      refetch();
      const membership = memberships.find(m => m.id === membershipId);
      toast({
        title: "Membership Updated!",
        description: `You are now a ${membership?.name} member with +${membership?.bonus}% bonus.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update membership",
      });
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount",
      });
      return;
    }

    setIsDepositing(true);
    setTimeout(() => {
      setIsDepositing(false);
      setShowDepositModal(false);
      setDepositAmount("");
      toast({
        title: "Deposit Initiated",
        description: `${amount} WLD deposit has been initiated. It will be reflected in your balance shortly.`,
      });
      refetch();
    }, 1500);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockWalletAddress);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleStaking = () => {
    const amount = parseFloat(stakingAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount",
      });
      return;
    }

    if (amount > mockWalletBalance) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Insufficient balance",
      });
      return;
    }

    setIsStaking(true);
    setTimeout(() => {
      setIsStaking(false);
      setShowStakingModal(false);
      setStakingAmount("");
      toast({
        title: "Staking Initiated",
        description: `${amount} FORTEX staked for ${stakingDuration} days. You'll earn rewards daily!`,
      });
      refetch();
    }, 1500);
  };

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
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-primary hover:bg-primary/10"
              onClick={() => setShowStakingModal(true)}
              data-testid="button-staking"
            >
              <Lock size={20} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-primary hover:bg-primary/10"
              onClick={() => setShowWalletModal(true)}
              data-testid="button-wallet"
            >
              <WalletIcon size={20} />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold">
                {(user?.username?.[0] || "U").toUpperCase()}
              </div>
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
                <Button className="w-full bg-white text-black hover:bg-gray-200" data-testid="button-start-mining">Start Mining</Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowDepositModal(true)}
                data-testid="button-deposit"
              >
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

        {/* Staking Modal */}
        {showStakingModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm border border-white/10 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold">Stake FORTEX</h2>
                <button 
                  onClick={() => setShowStakingModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  data-testid="button-close-staking"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Current Staking */}
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Currently Staking</p>
                  <p className="text-2xl font-bold text-white">{mockStakedAmount} FORTEX</p>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount to Stake (FORTEX)</label>
                  <input 
                    type="number" 
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                    placeholder="0"
                    max={mockWalletBalance}
                    data-testid="input-staking-amount"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Available: {mockWalletBalance} FORTEX</p>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Lock Duration</label>
                  <select 
                    value={stakingDuration}
                    onChange={(e) => setStakingDuration(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary/50"
                    data-testid="select-staking-duration"
                  >
                    <option value="30">30 Days (5% APY)</option>
                    <option value="90">90 Days (8% APY)</option>
                    <option value="180">180 Days (12% APY)</option>
                    <option value="365">365 Days (15% APY)</option>
                  </select>
                </div>

                {/* Info */}
                <div className="p-3 bg-primary/10 rounded-lg text-xs text-primary/80 border border-primary/20">
                  <p>Stake your FORTEX to earn daily rewards. The longer you lock, the higher your APY!</p>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStakingModal(false)}
                  data-testid="button-staking-cancel"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleStaking}
                  disabled={isStaking || !stakingAmount.trim()}
                  data-testid="button-confirm-staking"
                >
                  {isStaking ? "Processing..." : "Stake"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm border border-white/10 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold">Wallet</h2>
                <button 
                  onClick={() => setShowWalletModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  data-testid="button-close-wallet"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Wallet Balance */}
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
                  <p className="text-2xl font-bold text-white">{mockWalletBalance} WLD</p>
                </div>

                {/* Wallet Address */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Wallet Address</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={mockWalletAddress}
                      readOnly
                      className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none cursor-not-allowed"
                      data-testid="input-wallet-address"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyAddress}
                      data-testid="button-copy-address"
                    >
                      {walletCopied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                {/* Transactions Summary */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-muted-foreground mb-3">Activity</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Deposits:</span>
                      <span className="text-white font-semibold">500 WLD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Withdrawals:</span>
                      <span className="text-white font-semibold">249.5 WLD</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-muted-foreground">Current Balance:</span>
                      <span className="text-primary font-semibold">{mockWalletBalance} WLD</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => setShowWalletModal(false)}
                  data-testid="button-wallet-close"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm border border-white/10 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold">Deposit WLD</h2>
                <button 
                  onClick={() => setShowDepositModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  data-testid="button-close-deposit"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Amount */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount to Deposit (WLD)</label>
                  <input 
                    type="number" 
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                    placeholder="0"
                    data-testid="input-deposit-amount"
                  />
                </div>

                {/* Info */}
                <div className="p-3 bg-primary/10 rounded-lg text-xs text-primary/80 border border-primary/20">
                  <p>Deposits use your World Chain wallet. Funds will appear instantly after confirmation.</p>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDepositModal(false)}
                  data-testid="button-deposit-cancel"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleDeposit}
                  disabled={isDepositing || !depositAmount.trim()}
                  data-testid="button-confirm-deposit"
                >
                  {isDepositing ? "Processing..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Membership Section */}
        <h2 className="text-lg mb-4 text-white mt-8">Choose Your Membership</h2>
        <p className="text-sm text-muted-foreground mb-4">Boost your mining earnings with premium memberships</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {memberships.map((membership) => {
            const Icon = membership.icon;
            const isSelected = selectedMembership === membership.id;
            return (
              <motion.div
                key={membership.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
              >
                <Button
                  onClick={() => handleMembershipUpdate(membership.id)}
                  disabled={isUpdatingMembership}
                  className={`w-full p-4 rounded-xl transition-all ${
                    isSelected
                      ? "ring-2 ring-primary"
                      : ""
                  } glass-panel bg-gradient-to-br ${membership.color} opacity-80 hover:opacity-100`}
                  variant="ghost"
                  data-testid={`button-membership-${membership.id}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {Icon && <Icon className="w-5 h-5" />}
                    <h3 className="font-bold text-white text-sm">{membership.name}</h3>
                    {membership.price > 0 && (
                      <p className="text-xs text-white/70">{membership.price} WLD</p>
                    )}
                    <p className="text-xs text-white/80">+{membership.bonus}%</p>
                  </div>
                </Button>
              </motion.div>
            );
          })}
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
