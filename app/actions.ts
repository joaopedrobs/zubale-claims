"use server";

import { put } from "@vercel/blob";

export type FormState = {
  success: boolean;
  error?: string;
} | null;

export async function submitContestation(prevState: FormState, formData: FormData): Promise<FormState> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const lojaEnviada = formData.get("loja")?.toString();

  if (!webhookUrl) {
    console.error("Erro: N8N_WEBHOOK_URL não definida.");
    return { success: false, error: "Erro de configuração no servidor." };
  }

  try {
    // 1. Validação de Loja (CORREÇÃO DE URL)
    // Em produção, usar URL relativa ou absoluta correta é crucial.
    // Melhor abordagem: validar diretamente se possível ou garantir que a URL base esteja certa.
    const appUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    console.log("Validando loja na URL:", `${appUrl}/api/stores`); // Log para debug na Vercel

    try {
      const storeRes = await fetch(`${appUrl}/api/stores`);
      if (storeRes.ok) {
        const validStores = await storeRes.json();
        if (Array.isArray(validStores) && !validStores.includes(lojaEnviada)) {
          return { success: false, error: "Loja Inválida! Por favor, selecione uma opção da lista oficial." };
        }
      } else {
        console.warn("API de lojas falhou, pulando validação estrita de loja.");
      }
    } catch (e) {
      console.warn("Erro ao conectar na API de lojas, pulando validação.", e);
    }

    // 2. Upload de Evidências (COM TRATAMENTO DE ERRO)
    const files = formData.getAll("evidencias_files") as File[];
    let evidencias_urls: string[] = [];

    if (files && files.length > 0) {
      try {
        const uploadPromises = files
          .filter(file => file.size > 0 && file.name !== "undefined")
          .map(file => put(`contestacoes/${Date.now()}-${file.name}`, file, { access: 'public' }));

        if (uploadPromises.length > 0) {
          const blobs = await Promise.all(uploadPromises);
          evidencias_urls = blobs.map(b => b.url);
        }
      } catch (uploadError) {
        console.error("Erro no upload de arquivos:", uploadError);
        // Não falhar o envio todo se apenas o upload de imagem falhar
      }
    }

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
        source: "zubale-portal-v2"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro n8n (${response.status}):`, errorText);
      throw new Error(`Falha no n8n: ${response.status}`);
    }

    return { success: true };

  } catch (error) {
    console.error("Erro fatal no submitContestation:", error);
    return { success: false, error: "Falha ao enviar. Tente novamente." };
  }
}