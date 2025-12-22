import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

type MiniKitContextType = {
  isInstalled: boolean;
  username: string | null;
  setUsername: (name: string) => void;
  currentUser: any | null;
  setCurrentUser: (user: any) => void;
};

const MiniKitContext = createContext<MiniKitContextType | null>(null);

export function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    // Initialize MiniKit with a mock App ID for browser testing
    try {
      MiniKit.install({ 
        appId: 'app_staging_fortex_mining_game' 
      });
      setIsInstalled(MiniKit.isInstalled());
    } catch (err) {
      // MiniKit will fail if not in World App, but that's OK
      console.log('Running in browser mode - MiniKit not available');
      setIsInstalled(false);
    }
  }, []);

  return (
    <MiniKitContext.Provider value={{ isInstalled, username, setUsername, currentUser, setCurrentUser }}>
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
