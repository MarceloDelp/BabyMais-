exports.handler = async function (event) {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY não configurada");
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const messages = Array.isArray(body.messages)
      ? body.messages.map((msg) => ({
          role: msg.role,
          content: [
            {
              type: "text",
              text: msg.content,
            },
          ],
        }))
      : [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Olá",
              },
            ],
          },
        ];

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
      const errText = await response.text();
      throw new Error(errText);
    }

    const data = await response.json();

    const reply =
      data?.content?.find((c) => c.type === "text")?.text ||
      "Não consegui gerar uma resposta agora.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("ERRO REAL NO BACKEND:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};
