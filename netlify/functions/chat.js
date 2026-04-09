export async function handler(event) {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key não configurada" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const userMessage = body.message || "Olá";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        temperature: 0.4,
        system: `
Você é um assistente informativo voltado a cuidadores de crianças na primeira infância (0 a 6 anos).

Regras importantes:
- Ofereça apenas orientações gerais e educativas.
- Não faça diagnósticos.
- Não dê conselhos médicos.
- Não substitua profissionais de saúde ou educação.
- Use linguagem clara, acolhedora e responsável.
- Sempre incentive a busca por profissionais em caso de dúvidas específicas.
        `.trim(),
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();
    const text =
      data?.content?.[0]?.text ||
      "Não consegui gerar uma resposta agora.";

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: text,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno ao processar a resposta" }),
    };
  }
}
