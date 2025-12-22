import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type VerifyRequest } from "@shared/routes";
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useMiniKit } from "./use-minikit";

// Mock user ID for browser testing if MiniKit isn't present
const MOCK_WORLD_ID = "mock_world_id_123";

export function useUser() {
  const { isInstalled } = useMiniKit();
  // In a real app, we'd get the ID from the verify command or context
  // For this demo, we assume a connected user ID once verified
  const worldId = isInstalled ? (MiniKit.walletAddress || MOCK_WORLD_ID) : MOCK_WORLD_ID;

  return useQuery({
    queryKey: [api.user.get.path, worldId],
    queryFn: async () => {
      // In a real flow, you'd verify first, then fetch user. 
      // Here we assume we have the ID to fetch.
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
  const { isInstalled } = useMiniKit();

  return useMutation({
    mutationFn: async () => {
      let payload = { mock: true };
      
      if (isInstalled) {
        // Trigger World ID verification
        const verifyResponse = await MiniKit.commandsAsync.verify({
          action: 'login-action', 
          verification_level: VerificationLevel.Orb, // or Device
        });
        
        if (verifyResponse.finalPayload.status !== 'success') {
          throw new Error('Verification failed');
        }
        payload = verifyResponse.finalPayload;
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
      return api.auth.verify.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.user.get.path, data.worldId], data);
    }
  });
}
