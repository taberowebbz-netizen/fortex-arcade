"use client";

import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  // Inicializa MiniKit
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMiniKit = async () => {
      try {
        if (!MiniKit.isInstalled()) {
          MiniKit.install("app_222a6deb519ae275c079b71f4efdf84f"); // Seu App ID
          console.log("MiniKit instalado");
        }

        if (MiniKit.isInstalled()) {
          setIsReady(true);
          console.log("MiniKit pronto");
        }
      } catch (err) {
        console.error("Erro ao inicializar MiniKit:", err);
      }
    };

    initMiniKit();
  }, []);

  // Payload de verificação
  const verifyPayload: VerifyCommandInput = {
    action: "login", // Action ID do Developer Portal
    signal: "user-test-id-01", // Identificador opcional para testes
    verification_level: VerificationLevel.Orb,
  };

  // Função de login/verify
  const handleLogin = async () => {
    if (!MiniKit.isInstalled()) {
      alert("MiniKit não inicializado. Abra o app no World App.");
      return;
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (!finalPayload || finalPayload.status === "error") {
        console.warn("Verificação cancelada ou falhou:", finalPayload);
        alert("Verificação cancelada ou falhou. Certifique-se de estar no World App.");
        return;
      }

      // Envia para backend
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
        console.log("Payload recebido com sucesso!", finalPayload);
        alert("Login com World ID realizado com sucesso!");
      } else {
        console.error("Falha na verificação:", result);
        alert("Falha na verificação");
      }
    } catch (err) {
      console.error("Erro na verificação:", err);
      alert("Erro ao verificar World ID. Confira App ID, Action e domínio no Developer Portal.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black text-white">
      <h1 className="text-5xl font-bold mb-8">Fortex Arcade</h1>

      <p className="mb-6 text-center max-w-lg px-4">
        Clique no botão abaixo para verificar sua humanidade com World ID.
      </p>

      <button
        onClick={handleLogin}
        disabled={!isReady}
        className="rounded-full bg-green-600 px-10 py-5 text-2xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isReady ? "Connect World ID" : "Carregando MiniKit..."}
      </button>

      <p className="mt-8 text-sm opacity-70">
        Powered by Worldcoin MiniKit + Next.js
      </p>
      <p className="mt-6 text-sm opacity-70">
        ⚠️ O MiniKit só funciona dentro do World App. Para testes, abra o link no app.
      </p>
    </main>
  );
}
