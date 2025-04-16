import { EventEmitter } from 'events';

export class TableManager {
  // Cambio a un array simple de booleanos (false = sin bomba, true = con bomba)
  private tableState: boolean[] = Array(16).fill(false);
  
  constructor(private emitter: EventEmitter) {}

  /**
   * Procesa información del estado del tablero recibida de Arduino
   */
  public processTableData(line: string): void {
    // Detectar si estamos en la sección de estado del tablero
    if (line === "Estado del tablero:") {
      // Reiniciar el estado del tablero cuando comienza una nueva respuesta
      this.tableState = Array(16).fill(false);
      this.emitter.emit('table-state-reset');
      return;
    }

    // Procesar líneas del formato "N: 0" o "N: 1"
    const tableLineRegex = /^(\d+): ([01])$/;
    const match = line.match(tableLineRegex);
    
    if (match) {
      const position = parseInt(match[1], 10);
      const hasBomb = match[2] === "1";
      
      // Guardar directamente en la posición correcta del array (índice base 0)
      const index = position - 1;
      if (index >= 0 && index < 16) {
        this.tableState[index] = hasBomb;
        
        // Emitir evento de actualización para esta posición específica
        this.emitter.emit('table-position-updated', { position: index, value: hasBomb });
        
        // Contar cuántas posiciones están definidas
        const definedPositions = this.tableState.filter(pos => pos !== undefined).length;
        
        // Si ya tenemos 16 posiciones, emitir evento de tablero completo
        if (definedPositions === 16) {
          this.emitter.emit('table-state', [...this.tableState]);
        }
      }
    }
  }

  /**
   * Obtiene el estado actual del tablero como una lista de booleanos
   * @returns Array de booleanos donde true significa que hay bomba
   */
  public getCurrentState(): boolean[] {
    return [...this.tableState];
  }
  
  /**
   * Obtiene el estado actual del tablero como lista de 0 y 1
   * @returns Array de números (0 = sin bomba, 1 = con bomba)
   */
  public getCurrentStateAsNumbers(): number[] {
    return this.tableState.map(hasBomb => hasBomb ? 1 : 0);
  }
  
  /**
   * Obtiene el estado actual del tablero como string (para debug o visualización)
   * @returns String con 0s y 1s representando el estado del tablero
   */
  public getCurrentStateAsString(): string {
    return this.tableState.map(hasBomb => hasBomb ? '1' : '0').join(',');
  }
}