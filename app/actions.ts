"use server";

import { put } from "@vercel/blob";

export type FormState = {
  success: boolean;
  error?: string;
  protocolo?: string;
} | null;

// Gera Protocolo: YYYYMMDDHHMMSSXX (Ex: 2026011415300099)
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
  const lojaEnviada = formData.get("loja")?.toString();
  const protocoloGerado = generateProtocol();

  if (!webhookUrl) {
    console.error("ERRO: N8N_WEBHOOK_URL não configurada.");
    return { success: false, error: "Erro interno de configuração." };
  }

  try {
    // 1. Validação de Loja (Fail-safe: se a API falhar, permite o envio)
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
      console.warn("Aviso: Não foi possível validar a loja via API, prosseguindo.", e);
    }

    // 2. Upload de Evidências no Vercel Blob
    const files = formData.getAll("evidencias_files") as File[];
    let evidencias_urls: string[] = [];

    // Filtra arquivos vazios ou inválidos
    const validFiles = files.filter(file => file.size > 0 && file.name !== "undefined");

    if (validFiles.length > 0) {
      try {
        console.log(`Iniciando upload de ${validFiles.length} arquivos...`);
        
        const uploadPromises = validFiles.map(file => 
          put(`contestacoes/${protocoloGerado}-${file.name}`, file, { 
            access: 'public',
            // Adiciona timestamp para evitar cache agressivo ou colisão
            addRandomSuffix: false 
          })
        );

        const blobs = await Promise.all(uploadPromises);
        evidencias_urls = blobs.map(b => b.url);
        
        console.log("Uploads concluídos:", evidencias_urls);
      } catch (uploadError) {
        console.error("ERRO NO UPLOAD BLOB:", uploadError);
        // Decisão de negócio: Se o upload falhar, falhamos tudo ou enviamos sem foto?
        // Aqui optamos por não travar o envio, mas logar o erro.
      }
    }

    // 3. Preparar Payload para o n8n
    const rawData = Object.fromEntries(formData.entries());
    delete rawData.evidencias_files; // Remove o objeto File bruto

    // Formatar data para PT-BR no envio para o n8n (opcional, mas bom para leitura)
    const dataContestacaoISO = rawData.data_contestacao?.toString();
    const dataFormatada = dataContestacaoISO ? dataContestacaoISO.split('-').reverse().join('/') : '';

    const payload = {
      ...rawData,
      data_contestacao_br: dataFormatada, // Campo extra formatado
      protocolo: protocoloGerado,
      evidencias_urls, // Array de strings (URLs)
      timestamp: new Date().toISOString(),
      source: "zubale-portal-v2"
    };

    // 4. Envio Webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro n8n: ${response.status}`);
    }

    return { success: true, protocolo: protocoloGerado };

  } catch (error) {
    console.error("Erro fatal:", error);
    return { success: false, error: "Falha ao enviar. Tente novamente." };
  }
}