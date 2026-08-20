const fetch = require("node-fetch");

async function askAI(messages) {
  try {
    // 🧠 Prompt del sistema actualizado para que sepa que puede ver
    const systemPrompt = {
      role: "system",
      content: "Eres dekiller AI 🤖. Responde claro, útil y directo. Eres un asistente avanzado con visión computacional; puedes analizar las imágenes de la pantalla del usuario si te las envía. Si das código, usa bloques ``` correctamente. Ayuda en programación, tecnología y dudas."
    };

    const response = await fetch("[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "[https://dekiller-ai.onrender.com](https://dekiller-ai.onrender.com)",
        "X-Title": "Dekiller AI"
      },
      body: JSON.stringify({
        // 👁️ Cambiamos a GPT-4o-mini, que tiene visión y es muy rápido
        model: "openai/gpt-4o-mini", 
        messages: [systemPrompt, ...messages]
      })
    });

    const data = await response.json();

    console.log("Respuesta IA:", JSON.stringify(data, null, 2));

    // 🔍 Manejo de errores de API
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

