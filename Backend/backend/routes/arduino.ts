import express from 'express';
import { arduinoController } from '../controllers/arduinoController';

const router = express.Router();

// Ruta para enviar comandos al Arduino
router.post('/command', express.json(), arduinoController.sendCommand);

// Ruta para verificar la conexión con Arduino
router.get('/status', arduinoController.checkConnection);

export default router;