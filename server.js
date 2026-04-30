const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// 👇 opcional (para tu web)
const cors = require("cors");
app.use(cors());

const PORT = process.env.PORT || 3001;

// 🧠 Memoria de conversación
let conversation = [
  { role: "system", content: "Eres Dekiller, un asistente hacker, directo y útil." }
];

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // 👇 guardamos mensaje del usuario
    conversation.push({ role: "user", content: userMessage });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: conversation
      })
    });

    const data = await response.json();

    console.log("Respuesta completa:", JSON.stringify(data, null, 2));

    let reply = "Sin respuesta";

    if (data.choices && data.choices.length > 0) {
      reply = data.choices[0].message?.content || reply;
    } else if (data.message) {
      reply = data.message;
    } else if (data.output) {
      reply = data.output;
    } else if (data.content) {
      reply = data.content;
    } else {
      reply = JSON.stringify(data);
    }

    // 👇 guardamos respuesta de la IA
    conversation.push({ role: "assistant", content: reply });

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 👇 resetear memoria (útil)
app.post("/reset", (req, res) => {
  conversation = [
    { role: "system", content: "Eres Dekiller, un asistente hacker, directo y útil." }
  ];
  res.json({ status: "Memoria reiniciada" });
});

// 👇 opcional
app.get("/", (req, res) => {
  res.send("🚀 Dekiller API funcionando con memoria");
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy corriendo en http://localhost:${PORT}`);
});
