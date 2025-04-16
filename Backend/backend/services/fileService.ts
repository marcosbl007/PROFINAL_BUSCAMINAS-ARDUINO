// Service
import { Analizador } from './analizadorLS/analizador';
import { decoderCords } from './decoderCords';
import * as fs from 'fs';

export const fileService = {
    async processFile(file: Express.Multer.File) {
      try {
        // Crear una instancia del analizador
        const analizador = new Analizador();
        
        // Verificar que el archivo existe
        if (!file || !file.path) {
          throw new Error('Archivo de configuración no válido');
        }
      
      // Analizar el archivo
      const resultado = analizador.analizarArchivoConfig(file.path);
      
      // Si hay errores, lanzar una excepción detallada
      if (resultado.errores.length > 0) {
        const errorMsg = resultado.errores.map(e => `${e.tipo}: ${e.descripcion}`).join('; ');
        throw new Error(`Errores en la configuración: ${errorMsg}`);
      }
      
      // Procesar configuración para convertir coordenadas a posiciones
      let bombasConvertidas: { position: number, x: number, y: number }[] = [];
      
      if (resultado.configuracion?.config) {
        bombasConvertidas = resultado.configuracion.config
          .filter(item => item.contenido && typeof item.contenido.x === 'number' && typeof item.contenido.y === 'number')
          .map(item => {
            // Obtener coords X e Y del contenido
            const x = item.contenido!.x;
            const y = item.contenido!.y;
            
            // Convertir a posición en el tablero
            const position = decoderCords.xyToPosition(x, y);
            
            // Devolver objeto con ambos datos
            return {
              position,
              x, 
              y,
              // Incluir info extra para depuración si es necesario
              _line: item.linea,
              _column: item.columna
            };
          })
          // Filtrar posiciones inválidas
          .filter(item => item.position !== -1);
      }
      
      // Devolver la configuración procesada con las posiciones ya convertidas
      return {
        configData: resultado.configuracion,
        bombPositions: bombasConvertidas,
        fileName: file.originalname,
        processedAt: new Date()
      };
    } catch (error) {
      console.error('Error analizando archivo de configuración:', error);
      throw error;
    }
  }
};