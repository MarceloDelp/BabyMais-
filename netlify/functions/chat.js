export async function handler(event) {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "CLAUDE_API_KEY não configurada" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { system = "", messages = [] } = body;

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
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();

    // ✅ EXTRAÇÃO CORRETA DO TEXTO DO CLAUDE
    const reply =
      data?.content?.find((c) => c.type === "text")?.text ||
      "Não consegui gerar uma resposta agora.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Erro no handler:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erro ao processar a mensagem",
      }),
    };
  }
}
``
