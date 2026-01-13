// app/api/stores/route.ts
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // <--- ADICIONE ESTA LINHA

export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!sheetId || !apiKey) {
    return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });
  }

  // Aumentamos o range para garantir que pegamos tudo (ex: até a linha 2000)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A2:A2000?key=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (!data.values) return NextResponse.json([]);

    // 1. Transformamos em array simples
    // 2. Removemos espaços extras
    // 3. Usamos "new Set()" para eliminar duplicados automaticamente
    const uniqueStores = Array.from(
      new Set(
        data.values
          .map((row: any) => row[0]?.toString().trim())
          .filter((name: string) => name && name.length > 0)
      )
    ).sort();

    return NextResponse.json(uniqueStores);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar lojas" }, { status: 500 });
  }
}