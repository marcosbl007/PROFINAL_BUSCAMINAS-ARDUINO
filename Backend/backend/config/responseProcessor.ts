import { EventEmitter } from 'events';

export class ResponseProcessor {
  private responseBuffer: string[] = [];
  private waitingForResponse: boolean = false;
  
  constructor(private emitter: EventEmitter) {}

  /**
   * Inicia la espera de respuesta
   */
  public startWaiting(): void {
    this.responseBuffer = [];
    this.waitingForResponse = true;
  }

  /**
   * Procesa una línea de respuesta de Arduino
   */
  public processLine(line: string): void {
    if (!this.waitingForResponse) return;
    
    this.responseBuffer.push(line);
    
    // Si recibimos marca de fin de respuesta, emitir evento
    if (line === "END_RESPONSE") {
      this.waitingForResponse = false;
      this.emitter.emit('response-complete', [...this.responseBuffer]);
    }
  }

  /**
   * Procesa mensajes de estado, errores y advertencias
   */
  public processStatusMessage(line: string): void {
    if (line.startsWith("ERROR:")) {
      this.emitter.emit('error-message', line.substring(6).trim());
    } else if (line.startsWith("WARN:")) {
      this.emitter.emit('warning-message', line.substring(5).trim());
    } else if (line.startsWith("OK:")) {
      this.emitter.emit('success-message', line.substring(3).trim());
    }
  }

  /**
   * Cancela la espera de respuesta y devuelve el buffer actual
   */
  public cancelWaiting(): string[] {
    this.waitingForResponse = false;
    const response = [...this.responseBuffer];
    this.responseBuffer = [];
    return response;
  }

  /**
   * Verifica si hay un mensaje exitoso en la respuesta
   */
  public isSuccessResponse(responseData: string[]): boolean {
    const hasSuccess = responseData.some(line => line.startsWith('OK:'));
    const hasError = responseData.some(line => line.startsWith('ERROR:'));
    return hasSuccess && !hasError;
  }
}