const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { askAI } = require("../services/ai");
const fs = require("fs");

if (!fs.existsSync("memory")) {
  fs.mkdirSync("memory");
}

const memoryPath = "memory/memory.json";

function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(memoryPath));
  } catch {
    return [];
  }
}

function saveMemory(data) {
  fs.writeFileSync(memoryPath, JSON.stringify(data, null, 2));
}

router.post("/", async (req, res) => {
  try {
    let conversation = loadMemory();
    const userMessage = req.body.message || "";
    const userImage = req.body.image; // 📸 Recibimos la imagen en Base64

    if (!userMessage && !userImage) {
      return res.json({ reply: "⚠️ Escribe algo o envía una imagen." });
    }

    // ⚡ comandos de sistema
    if (userMessage === "/reset") {
      saveMemory([]);
      return res.json({ reply: "🧠 Memoria borrada." });
    }

    if (userMessage === "/help") {
      return res.json({
        reply: `📌 Comandos:\n/reset → borra memoria\n/help → ver ayuda\n💡 Novedad: Ahora puedes enviarme imágenes de tu pantalla.`
      });
    }

    // 🎯 INTERCEPTOR DE APPS (Se mantiene intacto)
    const mensajeMinusculas = userMessage.toLowerCase();
    
    if (mensajeMinusculas.startsWith("abre ") || mensajeMinusculas.startsWith("abrir ")) {
      let app = mensajeMinusculas.replace("abre ", "").replace("abrir ", "").trim();
      let paquete = "";

      if (app.includes("youtube")) paquete = "com.google.android.youtube";
      else if (app.includes("whatsapp")) paquete = "com.whatsapp";
      else if (app.includes("facebook")) paquete = "com.facebook.katana";
      else if (app.includes("chrome")) paquete = "com.android.chrome";
      else if (app.includes("tiktok")) paquete = "com.zhiliaoapp.musically";

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

    // 📌 BÚSQUEDA EN PINTEREST
    const pinterestMatch = (() => {
      const text = userMessage.trim();

      const intent = /^(?:por favor,?\s*)?(?:busca|buscar|encuentra|muestra|muéstrame|muestrame|dame|enséñame|enseñame|search|find)\s+/i;

      if (!intent.test(text)) return null;

      let query = text.replace(intent, "").trim();

      // Quitar Pinterest al principio o al final.
      query = query.replace(/^en\s+pinterest\s+/i, "");
      query = query.replace(/\s+(?:de|en)\s+pinterest[.!?]*$/i, "");

      // Quitar palabras que indican que se solicita una imagen.
      query = query.replace(/^(?:(?:una?|algunas?)\s+)?(?:imágenes?|imagenes?|fotos?|wallpapers?)\s+(?:de|sobre)\s+/i, "");
      query = query.replace(/^(?:una?|algunas?)\s+(?:imagen|foto)\s+(?:de|sobre)\s+/i, "");

      query = query.replace(/[.!?]+$/, "").trim();

      return query ? { 1: query } : null;
    })();

    if (pinterestMatch) {
      const query = pinterestMatch[1];

      try {
        const pinterestUrl = `http://127.0.0.1:${process.env.PORT || 3001}/pinterest/search?q=${encodeURIComponent(query)}`;
        const response = await fetch(pinterestUrl);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Pinterest search failed");
        }

        const reply = data.results.length
          ? `🔎 Encontré ${data.results.length} resultados de Pinterest para: ${query}`
          : `🔎 No encontré Pins para: ${query}`;

        conversation.push({ role: "user", content: userMessage });
        conversation.push({ role: "assistant", content: reply });
        saveMemory(conversation.slice(-10));

        return res.json({ reply, pinterest: data });
      } catch (error) {
        console.error("Pinterest tool:", error);

        return res.status(502).json({
          reply: "❌ No pude buscar en Pinterest ahora mismo.",
          error: "pinterest_unavailable"
        });
      }
    }
    // 👁️ PREPARAR PAQUETE MULTIMODAL
    let messageContent;
    
    if (userImage) {
      // Formato especial que pide OpenRouter/OpenAI para imágenes
      messageContent = [
        { type: "text", text: userMessage || "Analiza esta imagen y descríbela." },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${userImage}` } }
      ];
    } else {
      // Si es solo texto, lo mandamos normal
      messageContent = userMessage;
    }

    // Agregamos a la conversación y enviamos a la IA
    conversation.push({ role: "user", content: messageContent });
    
    const reply = await askAI(conversation);

    // 🧹 LIMPIEZA DE MEMORIA: Quitamos la imagen pesada antes de guardar
    if (userImage) {
      conversation.pop(); // Sacamos el paquete pesado
      conversation.push({ role: "user", content: userMessage ? `${userMessage} [🖼️ Imagen enviada]` : "[🖼️ Imagen enviada]" });
    }

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

