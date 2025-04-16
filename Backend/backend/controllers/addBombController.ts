import { Request, Response } from 'express';
import { arduinoSerial } from '../config/serialPort';

export const addBombController = {
  /**
   * Añade una bomba usando la posición proporcionada (1-16) y la envía al Arduino
   */
  async addBomb(req: Request, res: Response): Promise<void> {
    try {
      // Extraer el número de la propiedad position del objeto JSON
      const positionNum = Number(req.body.position);
      
      // Validar que se proporcionó un valor
      if (req.body.position === undefined || req.body.position === null) {
        res.status(400).json({
          success: false,
          error: 'Posición inválida. Se requiere enviar un número.'
        });
        return;
      }
      
      // Validar que sea un número entero válido entre 1 y 16
      if (!Number.isInteger(positionNum) || positionNum < 1 || positionNum > 16) {
        res.status(400).json({
          success: false,
          error: 'La posición debe ser un número entero entre 1 y 16'
        });
        return;
      }
      
      // Verificar conexión con Arduino
      if (!arduinoSerial.isArduinoConnected()) {
        res.status(503).json({
          success: false,
          error: 'No hay conexión con Arduino'
        });
        return;
      }
      
      // Crear comando para Arduino: "B" seguido del número de posición
      const command = `B${positionNum}`;
      
      // Enviar el comando al Arduino y esperar respuesta
      const { success, response } = await arduinoSerial.sendCommand(command);
      
      // Extraer estado del tablero de la respuesta
      let tableroActual: boolean[] = Array(16).fill(false);
      let statusMessage = "";
      
      // Buscar mensajes relevantes en la respuesta
      for (const line of response) {
        // Extraer estado de las posiciones del tablero
        const positionMatch = line.match(/^(\d+): ([01])$/);
        if (positionMatch) {
          const position = parseInt(positionMatch[1]) - 1; // Convertir a índice base 0
          const value = positionMatch[2] === "1";
          if (position >= 0 && position < 16) {
            tableroActual[position] = value;
          }
        }
        
        // Extraer mensaje de estado
        if (line.startsWith("OK:") || line.startsWith("ERROR:") || line.startsWith("WARN:")) {
          statusMessage = line;
        }
      }
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: statusMessage || 'Error al añadir la bomba',
          arduinoResponse: response,
          tableroActual
        });
        return;
      }
      
      res.status(201).json({
        success: true,
        message: statusMessage || `Se agregó la bomba en la posición ${positionNum}`,
        position: positionNum,
        arduinoResponse: response,
        tableroActual
      });
      
    } catch (error) {
      console.error('Error adding bomb:', error);
      res.status(500).json({
        success: false,
        error: 'Error al añadir la bomba',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};