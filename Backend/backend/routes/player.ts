import express from 'express';
import { playerController } from '../controllers/playerController';

const router = express.Router();

// Hacer movimiento (verificar posición)
router.post('/move', express.json(), playerController.makeMove);

export default router;