import { Request, Response } from 'express';
import { fileService } from '../services/fileService';
import { arduinoSerial } from '../config/serialPort';
import * as fs from 'fs';
import { decoderCords } from '../services/decoderCords';

export const uploadController = {
/**
 * Procesa un archivo subido, lo analiza y envía comandos al Arduino
 */
async processUploadedFile(req: Request, res: Response) {
  try {
    // Extraer datos de la petición
    const file = req.file;
    
    // Validación básica
    if (!file) {
      console.error('Error: No file provided');
      res.status(400).json({ error: 'No file provided' });
      return;
    }
    
    try {
      // Llamar al servicio para procesar el archivo
      const result = await fileService.processFile(file);
      
      // Convertir coordenadas a posiciones
      const bombPositions = [];
      
      if (result.configData?.config) {
        for (const item of result.configData.config) {
          if (item.contenido && typeof item.contenido.x === 'number' && typeof item.contenido.y === 'number') {
            const position = decoderCords.xyToPosition(item.contenido.x, item.contenido.y);
            if (position !== -1) {
              bombPositions.push(position);
            }
          }
        }
      }
      
      // Añadir información sobre el estado de la conexión Arduino
      const arduinoConnected = arduinoSerial.isArduinoConnected();
      
      // Enviar comandos al Arduino si está conectado
      let commandResults = [];
      
      if (arduinoConnected && bombPositions.length > 0) {
        // Procesar cada posición de bomba y enviar comando al Arduino
        for (const position of bombPositions) {
          try {
            const command = `B${position}`;
            console.log(`Enviando comando al Arduino: ${command}`);
            
            const cmdResult = await arduinoSerial.sendCommand(command);
            commandResults.push({
              position,
              success: cmdResult.success,
              response: cmdResult.response.join("\n")
            });
          } catch (cmdError) {
            console.error(`Error enviando comando para bomba en posición ${position}:`, cmdError);
            commandResults.push({
              position,
              success: false,
              error: cmdError instanceof Error ? cmdError.message : 'Error desconocido'
            });
          }
        }
      }
      
      // Eliminar el archivo temporal después de procesarlo
      try {
        fs.unlinkSync(file.path);
        console.log(`Archivo temporal eliminado: ${file.path}`);
      } catch (unlinkError) {
        console.warn(`No se pudo eliminar el archivo temporal ${file.path}:`, unlinkError);
      }
      
      // Enviar respuesta exitosa
      res.status(201).json({
        success: true,
        bombPositions: bombPositions,  // Solo devolvemos las posiciones
        arduino: {
          connected: arduinoConnected,
          commandResults: commandResults
        },
        currentTableState: arduinoConnected ? 
          arduinoSerial.getCurrentTableState() : 
          'Arduino no conectado'
      });
    } catch (processError) {
      // Si hay un error en el procesamiento, también intentamos limpiar
      if (file && file.path) {
        try { 
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }     
        } catch (unlinkError) {
          console.warn(`No se pudo eliminar el archivo temporal ${file.path}:`, unlinkError);
        }
      }
      
      // Re-lanzar el error para que lo maneje el catch principal
      throw processError;
    }
  } catch (error) {
    // Manejar errores
    console.error('Error processing file:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
};