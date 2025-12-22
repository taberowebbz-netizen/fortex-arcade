import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type MineRequest } from "@shared/routes";
import { useUser } from "./use-user";

export function useClaimMining() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (amount: number) => {
      const payload: MineRequest = { amount };
      const res = await fetch(api.mining.claim.path, {
        method: api.mining.claim.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const error = new Error(data.message || "Failed to claim tokens") as any;
        error.secondsUntilMine = data.secondsUntilMine;
        throw error;
      }
      
      return api.mining.claim.responses[200].parse(data);
    },
    onSuccess: () => {
      if (user?.worldId) {
        queryClient.invalidateQueries({ queryKey: [api.user.get.path, user.worldId] });
      }
    },
  });
}
