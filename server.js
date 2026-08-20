const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// conectar rutas
const chatRoute = require("./routes/chat");
app.use("/chat", chatRoute);

// AQUÍ ESTÁ LA MAGIA: Le indicamos que envíe tu diseño web
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log("Node version:", process.version);
});

