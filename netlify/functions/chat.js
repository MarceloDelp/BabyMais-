export async function handler(event) {
  try {
    // 1. Validar método
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    // 2. Validar API Key
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY não configurada");
    }

    // 3. Parse do body
    const body = JSON.parse(event.body || "{}");
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Payload inválido: messages ausente ou vazio");
    }

    // 4. Chamada à Anthropic
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
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro Anthropic: ${errorText}`);
    }

    const data = await response.json();

    // 5. EXTRAÇÃO SEGURA DA RESPOSTA
    const textBlock = Array.isArray(data.content)
      ? data.content.find((c) => c.type === "text")
      : null;

    const reply = textBlock?.text;

    if (!reply) {
      throw new Error("Anthropic retornou resposta sem texto");
    }

    // 6. ✅ RETORNAR NO FORMATO QUE O FRONTEND ESPERA
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Erro no chat:", err.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Desculpa, tive um problema ao responder. Tente novamente.",
      }),
    };
  }
}
``
