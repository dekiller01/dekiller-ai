const fetch = require("node-fetch");

async function askAI(messages) {
  try {
    const systemPrompt = {
      role: "system",
      content: "Eres Dekiller AI 🤖. Responde claro, útil y directo. Eres un asistente avanzado con visión computacional; puedes analizar imágenes de la pantalla si te las envían. Si das código, usa bloques ``` correctamente."
    };

    // 🔗 URL absoluta garantizada
    const url = "[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "[https://dekiller-ai.onrender.com](https://dekiller-ai.onrender.com)",
        "X-Title": "Dekiller AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // 👁️ El nuevo cerebro con visión
        messages: [systemPrompt, ...messages]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error OpenRouter:", data.error);
      return "❌ Error con la API de IA";
    }

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message?.content || "Sin respuesta";
    }

    return "⚠️ No se pudo obtener respuesta";

  } catch (error) {
    console.error("Error en IA:", error);
    return "❌ Error conectando con la IA";
  }
}

module.exports = { askAI };

