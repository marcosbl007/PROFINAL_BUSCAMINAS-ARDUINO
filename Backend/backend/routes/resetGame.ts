import express from 'express';
import { resetGameController } from '../controllers/resetGameController';

const router = express.Router();

// Ruta para resetear solo el tablero
router.post('/table', resetGameController.resetTable);

// Ruta para resetear todo (factory reset)
router.post('/factory', resetGameController.factoryReset);

export default router;