const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// conectar rutas
const chatRoute = require("./routes/chat");
app.use("/chat", chatRoute);

app.get("/", (req, res) => {
res.send("🚀 VERSION NUEVA ACTIVA 🔥");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});
// update
