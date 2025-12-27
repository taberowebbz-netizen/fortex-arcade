"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (!MiniKit.isInstalled()) {
        MiniKit.install("app_222a6deb519ae275c079b71f4efdf84f");
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black text-white">
      <h1 className="text-5xl font-bold mb-8">Fortex Arcade</h1>

      <p className="text-xl mb-12 text-center max-w-lg px-4">
        Clique no botão abaixo para verificar sua humanidade com World ID.
      </p>

      <button
        disabled={!isReady}
        className="rounded-full bg-green-600 px-10 py-5 text-2xl font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {isReady ? "Connect World ID" : "Carregando MiniKit..."}
      </button>

      <p className="mt-8 text-sm opacity-70">
        Powered by Worldcoin MiniKit + Next.js
      </p>
    </main>
  );
}
