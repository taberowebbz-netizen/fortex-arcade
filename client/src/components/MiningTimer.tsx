import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MiningTimerProps {
  durationSeconds: number;
  onComplete: () => void;
  isActive: boolean;
  isCooldown?: boolean;
}

export function MiningTimer({ durationSeconds, onComplete, isActive, isCooldown = false }: MiningTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(durationSeconds);
      return;
    }

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onComplete, durationSeconds]);

  const progress = ((durationSeconds - timeLeft) / durationSeconds) * 100;

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Background Circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="128"
          cy="128"
          r="110"
          className="stroke-muted fill-none"
          strokeWidth="12"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="128"
          cy="128"
          r="110"
          className="stroke-primary fill-none drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          strokeWidth="12"
          strokeDasharray="691" // 2 * PI * 110
          strokeDashoffset={691 - (691 * progress) / 100}
          initial={{ strokeDashoffset: 691 }}
          animate={{ strokeDashoffset: 691 - (691 * progress) / 100 }}
          transition={{ duration: 1, ease: "linear" }}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Time Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-display tracking-widest text-white">
          {Math.floor(timeLeft / 3600)}h {Math.floor((timeLeft % 3600) / 60)}m {(timeLeft % 60).toString().padStart(2, '0')}s
        </span>
        <span className={`text-xs uppercase tracking-widest mt-1 ${isCooldown ? 'text-destructive' : 'text-primary'}`}>
          {isCooldown ? "Cooldown..." : isActive ? "Mining..." : "Ready"}
        </span>
      </div>
    </div>
  );
}
