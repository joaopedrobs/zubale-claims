import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!sheetId || !apiKey) {
    return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });
  }

  // Buscamos um range bem largo (A2:A5000) para garantir que nada fique de fora
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A2:A5000?key=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (!data.values) return NextResponse.json([]);

    // Limpeza profunda: remove nulos, espaços extras e duplicatas
    const uniqueStores = Array.from(
      new Set(
        data.values
          .map((row: any) => row[0]?.toString().trim())
          .filter((name: string) => name && name.length > 1)
      )
    ).sort();

    return NextResponse.json(uniqueStores);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao carregar lista oficial" }, { status: 500 });
  }
}