import { Request, Response } from 'express';
import { arduinoSerial } from '../config/serialPort';

export const arduinoController = {
  /**
   * Envía un comando al Arduino
   */
  async sendCommand(req: Request, res: Response): Promise<void> {
    try {
      const { command } = req.body;

      // Validar que se envió un comando válido
      if (!command || (command !== '0' && command !== '1')) {
        res.status(400).json({
          success: false,
          error: 'Comando inválido. Debe ser "0" (apagar) o "1" (encender)'
        });
        return;
      }

      // Enviar el comando al Arduino
      const success = await arduinoSerial.sendCommand(command);

      if (success) {
        res.status(200).json({
          success: true,
          message: command === '1' ? 'LED Encendido' : 'LED Apagado'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error al comunicarse con Arduino'
        });
      }
    } catch (error) {
      console.error('Error en el controlador de Arduino:', error);
      res.status(500).json({
        success: false,
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
  
  /**
   * Verifica el estado de la conexión con Arduino
   */
  async checkConnection(req: Request, res: Response): Promise<void> {
    try {
      const isConnected = arduinoSerial.isArduinoConnected();
      
      res.status(200).json({
        success: true,
        connected: isConnected,
        message: isConnected ? 'Arduino conectado' : 'Arduino desconectado'
      });
    } catch (error) {
      console.error('Error al verificar la conexión con Arduino:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar la conexión con Arduino'
      });
    }
  }
};