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

      if (!res.ok) throw new Error("Failed to claim tokens");
      return api.mining.claim.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      if (user?.worldId) {
        queryClient.invalidateQueries({ queryKey: [api.user.get.path, user.worldId] });
      }
    },
  });
}
