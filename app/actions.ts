"use server";

// Definimos um tipo para o estado para evitar erros de TypeScript
export type FormState = {
  success: boolean;
  error?: string;
} | null;

export async function submitContestation(prevState: FormState, formData: FormData): Promise<FormState> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return { success: false, error: "Configuração do servidor ausente (Webhook URL)." };
  }

  // Captura todos os campos dinamicamente
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        origem: "Portal de Contestações Next.js 15"
      }),
    });

    if (!response.ok) throw new Error("Falha no n8n");

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar:", error);
    return { success: false, error: "Não foi possível enviar sua solicitação. Tente novamente mais tarde." };
  }
}