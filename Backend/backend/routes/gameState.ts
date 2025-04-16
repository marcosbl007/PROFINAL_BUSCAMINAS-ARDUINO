import express from 'express';
import { gameStateController } from '../controllers/gameStateController';

const router = express.Router();

// Obtener estado del juego
router.get('/', gameStateController.getGameState);

// Cambiar estado del juego
router.post('/', express.json(), gameStateController.changeGameState);

export default router;