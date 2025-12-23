import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, type VerifyRequest } from "@shared/routes";
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useMiniKit } from "./use-minikit";

export function useUser() {
  const { currentUser, isLoading: contextLoading, setCurrentUser } = useMiniKit();

  const query = useQuery({
    queryKey: ['/api/me'],
    queryFn: async () => {
      const res = await fetch('/api/me');
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: !contextLoading,
    initialData: currentUser,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data && query.data?.id !== currentUser?.id) {
      setCurrentUser(query.data);
    }
  }, [query.data, currentUser?.id, setCurrentUser]);

  return query;
}

export function useVerify() {
  const queryClient = useQueryClient();
  const { isInstalled, setCurrentUser } = useMiniKit();

  return useMutation({
    mutationFn: async () => {
      let payload = { mock: true };
      
      if (isInstalled) {
        try {
          // Trigger World ID verification
          const verifyResponse = await MiniKit.commandsAsync.verify({
            action: 'login-action', 
            verification_level: VerificationLevel.Device, // Use Device for easier testing
          });
          
          if (verifyResponse.finalPayload.status !== 'success') {
            throw new Error('Verification failed');
          }
          payload = verifyResponse.finalPayload;
        } catch (err) {
          console.log('MiniKit verify failed, using mock:', err);
          payload = { mock: true };
        }
      }

      // Send proof to backend
      const res = await fetch(api.auth.verify.path, {
        method: api.auth.verify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload,
          action: 'login-action'
        } as VerifyRequest),
      });

      if (!res.ok) throw new Error("Backend verification failed");
      const user = api.auth.verify.responses[200].parse(await res.json());
      return user;
    },
    onSuccess: (data) => {
      setCurrentUser(data);
      queryClient.setQueryData(['/api/me'], data);
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    }
  });
}
