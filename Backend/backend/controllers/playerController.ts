import { Request, Response } from 'express';
import { arduinoSerial } from '../config/serialPort';

export const playerController = {
  /**
   * Realiza movimiento del jugador para verificar una posición
   */
  async makeMove(req: Request, res: Response): Promise<void> {
    try {
      const { position } = req.body;
      
      // Validar que la posición sea un número entre 1 y 16
      if (!Number.isInteger(position) || position < 1 || position > 16) {
        res.status(400).json({
          success: false,
          error: 'Posición inválida. Debe ser un número entre 1 y 16'
        });
        return;
      }
      
      if (!arduinoSerial.isArduinoConnected()) {
        res.status(503).json({
          success: false,
          error: 'No hay conexión con Arduino'
        });
        return;
      }
      
      // Enviar comando al Arduino
      const command = `U${position}`;
      const { success, response } = await arduinoSerial.sendCommand(command);
      
      // Analizar respuesta para determinar resultado
      const isGameOver = response.some(line => line.includes("GAME OVER"));
      const isVictory = response.some(line => line.includes("¡HAS GANADO!"));
      const scoreInfo = response.filter(line => line.includes("Score actual:") || line.includes("Puntaje final:"));
      
      // Extraer score si está disponible
      let score = 0;
      for (const line of scoreInfo) {
        const match = line.match(/Score actual:\s+(\d+)|Puntaje final:\s+(\d+)/);
        if (match) {
          score = parseInt(match[1] || match[2]);
        }
      }
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Error al verificar posición',
          arduinoResponse: response
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        position: position,
        gameOver: isGameOver,
        victory: isVictory,
        score: score,
        gameState: arduinoSerial.getCurrentTableState(),
        arduinoResponse: response
      });
      
    } catch (error) {
      console.error('Error making move:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al verificar posición',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};