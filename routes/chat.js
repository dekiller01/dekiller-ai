const express = require("express");
const router = express.Router();
const { askAI } = require("../services/ai");
const fs = require("fs");

// 📁 Crear carpeta si no existe
if (!fs.existsSync("memory")) {
  fs.mkdirSync("memory");
}

// ✅ Nombre corregido (evita conflicto con "path")
const memoryPath = "memory/memory.json";

// 📥 Cargar memoria
function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(memoryPath));
  } catch {
    return [];
  }
}

// 💾 Guardar memoria
function saveMemory(data) {
  fs.writeFileSync(memoryPath, JSON.stringify(data, null, 2));
}

// 🚀 Ruta principal
router.post("/", async (req, res) => {
  try {
    let conversation = loadMemory();

    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "⚠️ Escribe algo." });
    }

    // ⚡ comandos
    if (userMessage === "/reset") {
      saveMemory([]);
      return res.json({ reply: "🧠 Memoria borrada." });
    }

    if (userMessage === "/help") {
      return res.json({
        reply: `📌 Comandos:
/reset → borra memoria
/help → ver ayuda

💡 Puedes pedirme código, explicaciones o ayuda técnica.`
      });
    }

    // 💬 conversación
    conversation.push({ role: "user", content: userMessage });

    const reply = await askAI(conversation);

    conversation.push({ role: "assistant", content: reply });

    // 🧠 limitar memoria
    conversation = conversation.slice(-10);

    saveMemory(conversation);

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en chat" });
  }
});

module.exports = router;
