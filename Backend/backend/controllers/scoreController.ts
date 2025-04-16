import { Request, Response } from 'express';
import { arduinoSerial } from '../config/serialPort';

export const scoreController = {
  /**
   * Obtiene la tabla de puntuaciones (TOP5)
   */
  async getScores(req: Request, res: Response): Promise<void> {
    try {
      if (!arduinoSerial.isArduinoConnected()) {
        res.status(503).json({
          success: false,
          error: 'No hay conexión con Arduino'
        });
        return;
      }
      
      // Solicitar puntuaciones al Arduino
      const { success, response } = await arduinoSerial.sendCommand('P');
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Error al obtener puntuaciones',
          arduinoResponse: response
        });
        return;
      }
      
      // Extraer puntuaciones del formato "N. SCORE"
      const scores = response
        .filter(line => /^\d+\.\s+\d+$/.test(line))
        .map(line => {
          const match = line.match(/^\d+\.\s+(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        });
      
      res.status(200).json({
        success: true,
        scores: scores,
        arduinoResponse: response
      });
      
    } catch (error) {
      console.error('Error getting scores:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al obtener puntuaciones',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};