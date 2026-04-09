export async function handler(event) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: cors(),
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
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();

    const reply =
      data?.content?.find((c) => c.type === "text")?.text ||
      "Não consegui gerar uma resposta agora.";

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Erro real no handler:", err);

    return {
      statusCode: 500,
      headers: cors(),
      body: JSON.stringify({
        error: err.message || "Erro ao processar mensagem",
      }),
    };
  }
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}
