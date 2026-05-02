const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function askAI(messages) {
  try {
    // 🧠 Prompt del sistema (clave)
    const systemPrompt = {
      role: "system",
      content: "Eres Dekiller AI 🤖. Responde claro, útil y directo. Si das código, usa bloques ``` correctamente. Ayuda en programación, tecnología y dudas."
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://dekiller-ai.onrender.com",
        "X-Title": "Dekiller AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
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
