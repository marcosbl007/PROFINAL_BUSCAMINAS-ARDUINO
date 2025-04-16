import { Request, Response } from 'express';
import { arduinoSerial } from '../config/serialPort';

export const gameStateController = {
  /**
   * Obtiene el estado actual del juego
   */
  async getGameState(req: Request, res: Response): Promise<void> {
    try {
      if (!arduinoSerial.isArduinoConnected()) {
        res.status(503).json({
          success: false,
          error: 'No hay conexión con Arduino'
        });
        return;
      }
      
      // Solicitar estado del juego al Arduino
      const { success, response } = await arduinoSerial.sendCommand('S');
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Error al obtener estado del juego',
          arduinoResponse: response
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        gameState: arduinoSerial.getCurrentTableState(),
        arduinoResponse: response
      });
      
    } catch (error) {
      console.error('Error getting game state:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al obtener estado del juego',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  
  /**
   * Cambia el estado del juego (configuración/jugando)
   */
  async changeGameState(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      
      if (status !== 'configurando' && status !== 'jugando') {
        res.status(400).json({
          success: false,
          error: 'Estado inválido. Use "configurando" o "jugando"'
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
      
      // Convertir estado a comando para Arduino
      const stateValue = status === 'configurando' ? 0 : 1;
      const command = `E${stateValue}`;
      
      const { success, response } = await arduinoSerial.sendCommand(command);
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: `Error al cambiar estado a ${status}`,
          arduinoResponse: response
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: `Estado cambiado a ${status}`,
        arduinoResponse: response
      });
      
    } catch (error) {
      console.error('Error changing game state:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al cambiar estado del juego',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};