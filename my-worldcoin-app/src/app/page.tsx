"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (!MiniKit.isInstalled()) {
        MiniKit.install("app_222a6deb519ae275c079b71f4efdf84f"); // Seu App ID
        console.log("MiniKit instalado");
      }

      // Garantir que setIsReady é chamado apenas quando instalado
      if (MiniKit.isInstalled()) {
        setIsReady(true);
        console.log("MiniKit pronto para uso");
      }
    } catch (err) {
      console.error("Erro ao inicializar MiniKit:", err);
    }
  }, []);

  const handleLogin = async () => {
    if (!MiniKit.isInstalled()) {
      alert("MiniKit não inicializado. Abra o app no World App.");
      return;
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: "login",           // Action ID do Developer Portal
        signal: "user-test-id-01", // Identificador opcional para testes
      });

      if (!finalPayload) {
        alert("Verificação cancelada ou falhou. Certifique-se de estar no World App.");
        console.warn("FinalPayload não retornado:", finalPayload);
        return;
      }

      console.log("Payload final recebido:", finalPayload);
      alert("MiniKit funcionando! Payload recebido.");
    } catch (err) {
      console.error("Erro ao verificar MiniKit:", err);
      alert("Erro ao verificar World ID. Confira App ID, Action e domínio no Developer Portal.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold mb-8">Teste MiniKit</h1>

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

      <p className="mt-6 text-sm opacity-70">
        ⚠️ O MiniKit só funciona dentro do World App. Para testes, abra o link no app.
      </p>
    </main>
  );
}
