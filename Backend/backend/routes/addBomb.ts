import express from 'express';
import { addBombController } from '../controllers/addBombController';

const router = express.Router();

// Usar express.json() middleware para procesar datos JSON
router.post('/', express.json(), addBombController.addBomb);

export default router;