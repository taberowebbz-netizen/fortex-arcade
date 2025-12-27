"use client";

import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  // Inicializa MiniKit
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (!MiniKit.isInstalled()) {
        MiniKit.install("app_222a6deb519ae275c079b71f4efdf84f"); // ← Teu App ID real
        console.log("MiniKit instalado");
      }

      if (MiniKit.isInstalled()) {
        console.log("MiniKit pronto");
        setIsReady(true);
      }
    } catch (err) {
      console.error("Erro ao inicializar MiniKit:", err);
    }
  }, []);

  // Payload de verificação
  const verifyPayload: VerifyCommandInput = {
    action: "login",             // mesma action do Developer Portal
    signal: "user-unique-id",    // opcional, identifica o usuário
    verification_level: VerificationLevel.Orb, // Orb ou Device
  };

  // Função de login/verify com MiniKit
  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      alert("MiniKit não inicializado");
      return;
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (!finalPayload || finalPayload.status === "error") {
        console.log("Verificação cancelada ou falhou", finalPayload);
        alert("Verificação cancelada ou falhou");
        return;
      }

      // Envia para backend para validação
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: verifyPayload.action,
          signal: verifyPayload.signal,
        }),
      });

      const result = await response.json();

      if (result.status === 200) {
        console.log("Verification success!");
        alert("Login com World ID realizado com sucesso!");
      } else {
        console.log("Verification failed:", result);
        alert("Falha na verificação");
      }
    } catch (err) {
      console.error("Erro na verificação:", err);
      alert("Erro ao verificar World ID");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black text-white">
      <h1 className="text-5xl font-bold mb-8">Fortex Arcade</h1>

      <p className="text-xl mb-12 text-center max-w-lg px-4">
        Clique no botão abaixo para verificar sua humanidade com World ID.
      </p>

      <button
        onClick={handleVerify}
        disabled={!isReady}
        className="rounded-full bg-green-600 px-10 py-5 text-2xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isReady ? "Connect World ID" : "Carregando MiniKit..."}
      </button>

      <p className="mt-8 text-sm opacity-70">
        Powered by Worldcoin MiniKit + Next.js
      </p>
    </main>
  );
}
