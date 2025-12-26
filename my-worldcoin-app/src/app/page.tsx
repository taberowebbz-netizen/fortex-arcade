"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMiniKitReady, setIsMiniKitReady] = useState(false);

  useEffect(() => {
    // Inicialização do MiniKit (apenas a string do App ID)
    if (typeof window !== "undefined" && MiniKit && !MiniKit.isInstalled()) {
      MiniKit.install("app_222a6deb519ae275c079b71f4efdf84f"); // ← Teu App ID real
      console.log("MiniKit inicializado com sucesso!");
      setIsMiniKitReady(true);
    } else if (MiniKit.isInstalled()) {
      setIsMiniKitReady(true);
    }
  }, []);

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      alert("MiniKit não inicializado");
      return;
    }

    try {
      const response = await MiniKit.commandsAsync.verify({
        action: "login",
      });

      if (response.finalPayload) {
        alert("Verificação sucesso! Payload recebido.");
        console.log("Payload:", response.finalPayload);
      } else {
        alert("Verificação cancelada");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na verificação");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black text-white">
      <h1 className="text-5xl font-bold mb-8">My Worldcoin Mini App</h1>
      <p className="text-xl mb-12 text-center max-w-lg">
        Clique no botão abaixo para verificar sua humanidade com World ID.
      </p>

      <button
        onClick={handleVerify}
        disabled={!isMiniKitReady}
        className="rounded-full bg-green-600 px-10 py-5 text-2xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isMiniKitReady ? "Connect World ID" : "Carregando MiniKit..."}
      </button>

      <p className="mt-8 text-sm opacity-70">
        Powered by Worldcoin MiniKit + Next.js
      </p>
    </main>
  );
}