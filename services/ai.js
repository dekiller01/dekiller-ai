const fetch = require("node-fetch");

async function askAI(messages) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: messages
      })
    });

    const data = await response.json();

    // DEBUG (opcional, puedes dejarlo)
    console.log("Respuesta IA:", JSON.stringify(data, null, 2));

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
