export async function handler(event) {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) throw new Error("CLAUDE_API_KEY ausente");

    const body = JSON.parse(event.body || "{}");

    if (!Array.isArray(body.messages)) {
      throw new Error("messages inválido");
    }

    // ✅ ADAPTA O FORMATO PARA O CLAUDE
    const formattedMessages = body.messages.map((msg) => ({
      role: msg.role,
      content: [
        {
          type: "text",
          text: msg.content,
        },
      ],
    }));

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
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();

    const reply =
      data.content?.[0]?.text ||
      "Não consegui gerar uma resposta agora.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Erro real:", err.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Desculpa, tive um problema ao responder. Tente novamente.",
      }),
    };
  }
}
``
