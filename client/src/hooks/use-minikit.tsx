import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

type MiniKitContextType = {
  isInstalled: boolean;
  username: string | null;
  setUsername: (name: string) => void;
};

const MiniKitContext = createContext<MiniKitContextType | null>(null);

export function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Initialize MiniKit
    MiniKit.install();
    setIsInstalled(MiniKit.isInstalled());
  }, []);

  return (
    <MiniKitContext.Provider value={{ isInstalled, username, setUsername }}>
      {children}
    </MiniKitContext.Provider>
  );
}

export function useMiniKit() {
  const context = useContext(MiniKitContext);
  if (!context) {
    throw new Error('useMiniKit must be used within a MiniKitProvider');
  }
  return context;
}
