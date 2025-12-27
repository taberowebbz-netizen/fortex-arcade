import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = await req.json();

    if (!payload) {
      return NextResponse.json({ status: 400, message: "Payload não enviado" });
    }

    // Apenas loga o payload para teste
    console.log("Payload recebido do frontend:", payload);
    console.log("Action:", action, "Signal:", signal);

    // Retorna sucesso temporário para testes
    return NextResponse.json({ status: 200, message: "Payload recebido com sucesso (teste)" });
  } catch (err) {
    console.error("Erro no backend:", err);
    return NextResponse.json({ status: 500, message: "Erro interno" });
  }
}
