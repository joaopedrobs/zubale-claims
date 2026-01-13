"use server";

export async function submitContestation(formData: FormData) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) return { success: false, error: "Erro de configuração no servidor." };

  // Agrupando todos os dados do FormData
  const rawData = Object.fromEntries(formData.entries());
  
  const payload = {
    ...rawData,
    timestamp: new Date().toISOString(),
    origem: "Portal de Contestações Next.js"
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error();
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao enviar. Verifique sua conexão." };
  }
}