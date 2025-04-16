import express from "express";
import cors from "cors";
import uploadRouter from "./routes/uploadFile"; // Importar el router de uploadConfig
import addBombRouter from "./routes/addBomb"; // Importar el router de uploadConfig
import arduinoRouter from './routes/arduino';
import resetGameRouter from './routes/resetGame';
import gameStateRouter from './routes/gameState';
import scoresRouter from './routes/scores';
import playerRouter from './routes/player';




// Crear la aplicación Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de ejemplo
// Ruta principal - Hola mundo
app.get("/", (req, res) => {
  res.send("¡Hola Mundo desde Express!");
});

// Ruta para verificar el estado de la API
app.get("/api/status", (req, res) => {
  res.json({ 
    status: "online",
    message: "API funcionando correctamente",
    timestamp: new Date()
  });
});

// Ruta de ejemplo con parámetros
app.get("/api/saludar/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  res.json({ 
    mensaje: `¡Hola, ${nombre}!`,
    hora: new Date().toLocaleTimeString()
  });
});

// Ruta POST para recibir datos
app.post("/api/datos", (req, res) => {
  const datos = req.body;
  console.log("Datos recibidos:", datos);
  
  res.status(201).json({
    mensaje: "Datos recibidos correctamente",
    datosRecibidos: datos
  });
});

app.use('/api/upload', uploadRouter);

app.use('/api/addBomb', addBombRouter);

app.use('/api/arduino', arduinoRouter);

app.use('/api/reset', resetGameRouter);

app.use('/api/game', gameStateRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/player', playerRouter);


// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl
  });
});



export default app;