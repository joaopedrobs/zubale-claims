"use server";

import { put } from "@vercel/blob";

export type FormState = {
  success: boolean;
  error?: string;
} | null;

export async function submitContestation(prevState: FormState, formData: FormData): Promise<FormState> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const lojaEnviada = formData.get("loja")?.toString();

  if (!webhookUrl) return { success: false, error: "Erro de configuração no servidor." };

  try {
    // 1. Validação de Segurança: Buscar a lista oficial para conferir a loja
    const storeRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stores`);
    const validStores = await storeRes.json();
    
    if (!validStores.includes(lojaEnviada)) {
      return { success: false, error: "Loja Inválida! Por favor, selecione uma opção da lista oficial." };
    }

    // 2. Upload de Evidências (Opcional)
    const files = formData.getAll("evidencias_files") as File[];
    const uploadPromises = files
      .filter(file => file.size > 0)
      .map(file => put(`contestacoes/${Date.now()}-${file.name}`, file, { access: 'public' }));

    const blobs = await Promise.all(uploadPromises);
    const evidencias_urls = blobs.map(b => b.url);

    // 3. Envio para n8n
    const rawData = Object.fromEntries(formData.entries());
    delete rawData.evidencias_files;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...rawData,
        evidencias_urls,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error();

    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao enviar. Tente novamente." };
  }
}