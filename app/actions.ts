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
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${random}`;
}

export async function submitForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const apiToken = process.env.N8N_API_TOKEN;
  const formType = formData.get("form_type")?.toString() || "generico";
  const protocoloGerado = generateProtocol();

  if (!webhookUrl || !apiToken) return { success: false, error: "Erro de configuração no servidor." };

  try {
    // 1. Validação de Loja (Apenas se o formulário tiver o campo 'loja')
    const lojaEnviada = formData.get("loja")?.toString();
    if (lojaEnviada) {
      const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      try {
        const storeRes = await fetch(`${appUrl}/api/stores`);
        if (storeRes.ok) {
          const validStores = await storeRes.json();
          if (Array.isArray(validStores) && !validStores.includes(lojaEnviada)) {
            return { success: false, error: "Loja Inválida! Selecione uma da lista." };
          }
        }
      } catch (e) {
        console.warn("Validação de loja pulada.", e);
      }
    }

    // 2. Upload de Evidências (Genérico)
    const files = formData.getAll("evidencias_files") as File[];
    let evidencias_urls: string[] = [];
    const validFiles = files.filter(file => file.size > 0 && file.name !== "undefined");

    if (validFiles.length > 0) {
      try {
        const uploadPromises = validFiles.map(file => 
          put(`solicitacoes/${formType}/${protocoloGerado}-${file.name}`, file, { access: 'public', addRandomSuffix: false })
        );
        const blobs = await Promise.all(uploadPromises);
        evidencias_urls = blobs.map(b => b.url);
      } catch (uploadError) {
        console.error("Erro upload:", uploadError);
      }
    }

    // 3. Payload para o n8n
    const rawData = Object.fromEntries(formData.entries());
    delete rawData.evidencias_files;

    const payload = {
      ...rawData,
      form_type: formType, // ESSENCIAL PARA O ROUTER DO N8N
      protocolo: protocoloGerado,
      evidencias_urls,
      timestamp: new Date().toISOString(),
      source: "zubale-portal-v2"
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-token-zuba": apiToken },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Erro n8n: ${response.status}`);

    return { success: true, protocolo: protocoloGerado };

  } catch (error) {
    console.error("Erro fatal:", error);
    return { success: false, error: "Falha ao enviar. Tente novamente." };
  }
}