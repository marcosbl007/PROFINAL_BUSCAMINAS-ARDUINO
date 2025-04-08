/**
 * Convierte coordenadas X,Y a posición numérica en un tablero 4x4
 */
export const decoderCords = {
  /**
   * Convierte coordenadas X,Y a posición numérica (1-16)
   * @param x Coordenada X (1-4)
   * @param y Coordenada Y (1-4)
   * @returns Posición numérica (1-16) o -1 si las coordenadas son inválidas
   */
  xyToPosition(x: number, y: number): number {
    // Validar coordenadas
    if (x < 1 || x > 4 || y < 1 || y > 4) {
      return -1;
    }
    
    // Fórmula: position = (y-1) * 4 + x
    return (y - 1) * 4 + x;
  },
  
  /**
   * Valida si las coordenadas son válidas para el tablero 4x4
   */
  validCoordinates(x: number, y: number): boolean {
    return x >= 1 && x <= 4 && y >= 1 && y <= 4;
  }
};