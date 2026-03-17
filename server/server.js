const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../public'));

// AI Config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Mock Database (In-memory for demo) - En producción usa Supabase/PostgreSQL
const users = {
  "test_user": { credits: 1, history: [] }
};

// --- ROUTES ---

// 1. Get User Data
app.get('/api/user/:id', (req, res) => {
  const user = users[req.params.id];
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json({ credits: user.credits });
});

// 2. AI Interview Chat
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;
  const user = users[userId];

  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  if (user.credits <= 0) return res.status(403).json({ error: "Sin créditos. Compra más para continuar." });

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Actúa como un oficial consular de la embajada de Estados Unidos. Tu tono es formal, directo y un poco estricto. Tu objetivo es entrevistar al aplicante para una visa B1/B2. Empieza la entrevista saludando y preguntando '¿Cuál es el motivo de su viaje?'" }],
        },
        {
          role: "model",
          parts: [{ text: "Buenos días. Soy el oficial encargado de su caso. Por favor, responda con claridad. ¿Cuál es el motivo de su viaje a los Estados Unidos?" }],
        },
        ...user.history
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    // Guardar historial para contexto
    user.history.push({ role: "user", parts: [{ text: message }] });
    user.history.push({ role: "model", parts: [{ text: response }] });

    // Descontar crédito si es el inicio de la entrevista (ejemplo simplificado)
    // En una app real, descontarías al iniciar la sesión de chat.

    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor de IA" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
