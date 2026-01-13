"use server";

import { put } from "@vercel/blob";

export type FormState = {
  success: boolean;
  error?: string;
} | null;

export async function submitContestation(prevState: FormState, formData: FormData): Promise<FormState> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) return { success: false, error: "Erro de servidor." };

  try {
    // 1. Processar múltiplos uploads (opcionais)
    const files = formData.getAll("evidencias_files") as File[];
    const uploadPromises = files
      .filter(file => file.size > 0)
      .map(file => 
        put(`contestacoes/${Date.now()}-${file.name}`, file, { access: 'public' })
      );

    const blobs = await Promise.all(uploadPromises);
    const evidencias_urls = blobs.map(b => b.url);

    // 2. Coletar o restante dos dados
    const data = Object.fromEntries(formData.entries());
    delete data.evidencias_files; // Limpa o objeto

    const payload = {
      ...data,
      evidencias: evidencias_urls, // Envia array de links para o n8n
      timestamp: new Date().toISOString(),
    };

    // 3. Enviar para n8n
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao enviar contestação." };
  }
}