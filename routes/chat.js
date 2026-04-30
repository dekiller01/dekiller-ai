const express = require("express");
const router = express.Router();
const { askAI } = require("../services/ai");
const fs = require("fs");

const path = "memory/memory.json";

function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch {
    return [];
  }
}

function saveMemory(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

router.post("/", async (req, res) => {
  try {
    let conversation = loadMemory();

    const userMessage = req.body.message;

    // ⚡ comandos
    if (userMessage === "/reset") {
      saveMemory([]);
      return res.json({ reply: "🧠 Memoria borrada." });
    }

    if (userMessage === "/help") {
      return res.json({
        reply: "Comandos disponibles: /reset, /help"
      });
    }

    conversation.push({ role: "user", content: userMessage });

    const reply = await askAI(conversation);

    conversation.push({ role: "assistant", content: reply });

    conversation = conversation.slice(-10);

    saveMemory(conversation);

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en chat" });
  }
});

module.exports = router;
