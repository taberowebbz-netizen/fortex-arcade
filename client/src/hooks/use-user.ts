import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type VerifyRequest } from "@shared/routes";
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useMiniKit } from "./use-minikit";

export function useUser() {
  const { currentUser } = useMiniKit();
  
  // If currentUser is set from login, use that
  const worldId = currentUser?.worldId;

  return useQuery({
    queryKey: [api.user.get.path, worldId],
    queryFn: async () => {
      if (!worldId) return null;
      
      const url = api.user.get.path.replace(':worldId', worldId);
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      
      return api.user.get.responses[200].parse(await res.json());
    },
    enabled: !!worldId,
  });
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
      // Store the user in context so useUser can fetch the data
      setCurrentUser(data);
      queryClient.setQueryData([api.user.get.path, data.worldId], data);
    }
  });
}
