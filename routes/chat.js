const express = require("express");
const router = express.Router();
const { askAI } = require("../services/ai");
const fs = require("fs");

// 📁 Crear carpeta si no existe
if (!fs.existsSync("memory")) {
  fs.mkdirSync("memory");
}

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

    // ⚡ comandos de sistema
    if (userMessage === "/reset") {
      saveMemory([]);
      return res.json({ reply: "🧠 Memoria borrada." });
    }

    if (userMessage === "/help") {
      return res.json({
        reply: `📌 Comandos:\n/reset → borra memoria\n/help → ver ayuda\n💡 Novedad: Prueba decir "Abre YouTube" o "Abre WhatsApp".`
      });
    }

    // 🎯 INTERCEPTOR DE APPS (¡El puente con Android!)
    const mensajeMinusculas = userMessage.toLowerCase();
    
    if (mensajeMinusculas.startsWith("abre ") || mensajeMinusculas.startsWith("abrir ")) {
      let app = mensajeMinusculas.replace("abre ", "").replace("abrir ", "").trim();
      let paquete = "";

      // Diccionario de paquetes de Android
      if (app.includes("youtube")) paquete = "com.google.android.youtube";
      else if (app.includes("whatsapp")) paquete = "com.whatsapp";
      else if (app.includes("facebook")) paquete = "com.facebook.katana";
      else if (app.includes("chrome")) paquete = "com.android.chrome";
      else if (app.includes("tiktok")) paquete = "com.zhiliaoapp.musically";

      // Si detecta la app, manda el comando oculto a Sketchware
      if (paquete !== "") {
        const respuestaApp = `🚀 Ejecutando protocolo: Abriendo ${app}...`;
        
        conversation.push({ role: "user", content: userMessage });
        conversation.push({ role: "assistant", content: respuestaApp });
        saveMemory(conversation.slice(-10));

        return res.json({ 
          reply: respuestaApp, 
          comando: "open_app", 
          paquete: paquete 
        });
      }
    }

    // 💬 Si no es una orden para abrir apps, la IA responde normal
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

