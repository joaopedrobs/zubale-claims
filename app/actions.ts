"use server";

import { put } from "@vercel/blob";

export type FormState = {
  success: boolean;
  error?: string;
  protocolo?: string;
} | null;

// Gera Protocolo: YYYYMMDDHHMMSSXX
function generateProtocol(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

export async function submitContestation(prevState: FormState, formData: FormData): Promise<FormState> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const apiToken = process.env.N8N_API_TOKEN; // <--- NOVA VARIÁVEL
  const lojaEnviada = formData.get("loja")?.toString();
  const protocoloGerado = generateProtocol();

  if (!webhookUrl || !apiToken) {
    console.error("ERRO: Variáveis de ambiente (URL ou TOKEN) não configuradas.");
    return { success: false, error: "Erro interno de configuração." };
  }

  try {
    // 1. Validação de Loja (Fail-safe)
    const appUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    try {
      const storeRes = await fetch(`${appUrl}/api/stores`);
      if (storeRes.ok) {
        const validStores = await storeRes.json();
        if (Array.isArray(validStores) && !validStores.includes(lojaEnviada)) {
          return { success: false, error: "Loja Inválida! Selecione uma da lista." };
        }
      }
    } catch (e) {
      console.warn("Aviso: Validação de loja pulada (erro API).", e);
    }

    // 2. Upload de Evidências (Vercel Blob)
    const files = formData.getAll("evidencias_files") as File[];
    let evidencias_urls: string[] = [];
    const validFiles = files.filter(file => file.size > 0 && file.name !== "undefined");

    if (validFiles.length > 0) {
      try {
        const uploadPromises = validFiles.map(file => 
          put(`contestacoes/${protocoloGerado}-${file.name}`, file, { 
            access: 'public',
            addRandomSuffix: false 
          })
        );
        const blobs = await Promise.all(uploadPromises);
        evidencias_urls = blobs.map(b => b.url);
      } catch (uploadError) {
        console.error("ERRO NO UPLOAD BLOB:", uploadError);
      }
    }

    // 3. Preparar Payload
    const rawData = Object.fromEntries(formData.entries());
    delete rawData.evidencias_files;

    const dataContestacaoISO = rawData.data_contestacao?.toString();
    const dataFormatada = dataContestacaoISO ? dataContestacaoISO.split('-').reverse().join('/') : '';

    const payload = {
      ...rawData,
      data_contestacao_br: dataFormatada,
      protocolo: protocoloGerado,
      evidencias_urls,
      timestamp: new Date().toISOString(),
      source: "zubale-portal-v2"
    };

    // 4. Envio Webhook COM CABEÇALHO DE SEGURANÇA
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "api-token-zuba": apiToken // <--- AUTENTICAÇÃO AQUI (Nome igual ao do n8n)
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Se a auth falhar, o n8n vai retornar 403 ou 401
      if (response.status === 403 || response.status === 401) {
        console.error("Erro de Autenticação no n8n. Verifique o Header Auth.");
      }
      throw new Error(`Erro n8n: ${response.status}`);
    }

    return { success: true, protocolo: protocoloGerado };

  } catch (error) {
    console.error("Erro fatal:", error);
    return { success: false, error: "Falha ao enviar. Tente novamente." };
  }
}