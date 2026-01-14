"use server";

export type FormState = {
  success: boolean;
  error?: string;
  protocolo?: string; // Novo campo para retornar o protocolo gerado
} | null;

// Função auxiliar para gerar protocolo YYYYMMDDHHMMSSXX
function generateProtocol(): string {
  const now = new Date();
  
  // Ajuste para fuso horário Brasil (UTC-3) se necessário, ou usar UTC
  // Aqui usando UTC para garantir padrão ISO simplificado
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // XX sendo 2 dígitos aleatórios
  const randomXX = Math.floor(Math.random() * 100).toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}${randomXX}`;
}

export async function submitContestation(prevState: FormState, formData: FormData): Promise<FormState> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const lojaEnviada = formData.get("loja")?.toString();

  // 1. Gerar Protocolo Automático
  const protocoloGerado = generateProtocol();

  if (!webhookUrl) {
    console.error("ERRO: N8N_WEBHOOK_URL não configurada.");
    return { success: false, error: "Erro interno de configuração. Contate o suporte." };
  }

  try {
    // 2. Validação de Segurança da Loja
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // Em produção na Vercel, usar VERCEL_URL se disponível
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : apiUrl;

    try {
      const storeRes = await fetch(`${baseUrl}/api/stores`);
      if (storeRes.ok) {
        const validStores = await storeRes.json();
        if (Array.isArray(validStores) && !validStores.includes(lojaEnviada)) {
          return { success: false, error: "Loja Inválida! Selecione uma opção da lista oficial." };
        }
      }
    } catch (e) {
      console.warn("Erro ao validar loja (API), seguindo com envio:", e);
    }

    // 3. Preparar dados para o n8n
    const rawData = Object.fromEntries(formData.entries());
    
    // Remove arquivos e campos desnecessários
    delete rawData.evidencias_files; 
    
    // Adiciona o protocolo gerado ao payload
    const payload = {
      ...rawData,
      protocolo: protocoloGerado, // Envia o protocolo gerado
      evidencias_urls: [], 
      timestamp: new Date().toISOString(),
      source: "zubale-portal-v2"
    };

    // 4. Envio para o Webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro no n8n:", response.status, errorText);
      throw new Error(`Erro n8n: ${response.status}`);
    }

    // Retorna sucesso E O PROTOCOLO para o frontend exibir
    return { success: true, protocolo: protocoloGerado };

  } catch (error) {
    console.error("Erro no submitContestation:", error);
    return { success: false, error: "Falha técnica ao enviar. Tente novamente mais tarde." };
  }
}