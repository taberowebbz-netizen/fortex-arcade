import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

type MiniKitContextType = {
  isInstalled: boolean;
  username: string | null;
  setUsername: (name: string) => void;
  currentUser: any | null;
  setCurrentUser: (user: any) => void;
  isLoading: boolean;
};

const MiniKitContext = createContext<MiniKitContextType | null>(null);

export function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const appId = import.meta.env.VITE_WORLDCOIN_APP_ID || 'app_staging_fortex';
      MiniKit.install(appId);
      setIsInstalled(MiniKit.isInstalled());
    } catch (err) {
      console.log('Running in browser mode - MiniKit not available');
      setIsInstalled(false);
    }
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          setUsername(user.username);
        }
      } catch (err) {
        console.log('No existing session');
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  return (
    <MiniKitContext.Provider value={{ isInstalled, username, setUsername, currentUser, setCurrentUser, isLoading }}>
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
