"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      MiniKit.install("app_222a6deb519ae275c079b71f4efdf84f"); // teu App ID
    }
    setReady(true);
  }, []);

  const handleLogin = async () => {
    try {
      const result = await MiniKit.commandsAsync.verify({
        action: "login",
      });

      if (result.finalPayload) {
        console.log("SUCCESS:", result.finalPayload);
        alert("Login com World ID realizado com sucesso!");
      } else {
        alert("Login cancelado");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao verificar World ID");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Fortex Arcade</h1>

      <button
        onClick={handleLogin}
        disabled={!ready}
        className="rounded-lg bg-green-600 px-8 py-4 text-xl hover:bg-green-700 disabled:opacity-50"
      >
        {ready ? "Login com World ID" : "Carregando..."}
      </button>
    </main>
  );
}
