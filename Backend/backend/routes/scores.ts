import express from 'express';
import { scoreController } from '../controllers/scoreController';

const router = express.Router();

// Obtener puntuaciones
router.get('/', scoreController.getScores);

export default router;