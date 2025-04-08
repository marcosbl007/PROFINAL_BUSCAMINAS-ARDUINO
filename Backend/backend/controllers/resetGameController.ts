import { Request, Response } from 'express';
import { arduinoSerial } from '../config/serialPort';

export const resetGameController = {
  /**
   * Resetea solo el tablero de juego (mantiene top 5 y puntaje)
   */
  async resetTable(req: Request, res: Response): Promise<void> {
    try {
      if (!arduinoSerial.isArduinoConnected()) {
        res.status(503).json({
          success: false,
          error: 'No hay conexión con Arduino'
        });
        return;
      }
      
      const command = "R"; // Reset parcial
      console.log(`Enviando comando de reset parcial: ${command}`);
      
      const { success, response } = await arduinoSerial.sendCommand(command);
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Error al resetear el tablero',
          arduinoResponse: response
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Tablero reseteado exitosamente',
        arduinoResponse: response,
        currentTableState: arduinoSerial.getCurrentTableState()
      });
      
    } catch (error) {
      console.error('Error resetting table:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al resetear el tablero',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  
  /**
   * Resetea todo el sistema (tablero, top 5, puntaje)
   */
  async factoryReset(req: Request, res: Response): Promise<void> {
    try {
      if (!arduinoSerial.isArduinoConnected()) {
        res.status(503).json({
          success: false,
          error: 'No hay conexión con Arduino'
        });
        return;
      }
      
      const command = "F"; // Reset completo
      console.log(`Enviando comando de reset completo: ${command}`);
      
      const { success, response } = await arduinoSerial.sendCommand(command);
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Error al realizar reset completo',
          arduinoResponse: response
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Reset completo realizado exitosamente',
        arduinoResponse: response,
        currentTableState: arduinoSerial.getCurrentTableState()
      });
      
    } catch (error) {
      console.error('Error performing factory reset:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al realizar reset completo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};