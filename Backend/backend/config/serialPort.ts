import { EventEmitter } from 'events';
import { ArduinoResponse } from './serialTypes';
import { TableManager } from './tableManager';
import { ResponseProcessor } from './responseProcessor';
import { SerialConnection } from './serialConnection';

/**
 * Clase para manejar la comunicación serial con Arduino
 * Implementa patrón Singleton y EventEmitter para notificar cambios
 */
class ArduinoSerialManager extends EventEmitter {
  private static instance: ArduinoSerialManager;
  private tableManager: TableManager;
  private responseProcessor: ResponseProcessor;
  private serialConnection: SerialConnection;

  private constructor() {
    super();
    
    // Inicializar componentes
    this.tableManager = new TableManager(this);
    this.responseProcessor = new ResponseProcessor(this);
    this.serialConnection = new SerialConnection(
      { portName: 'COM2', baudRate: 9600 },
      this
    );
    
    // Configurar listeners de eventos
    this.setupEventListeners();
    
    // Iniciar conexión con Arduino
    this.serialConnection.connect();
  }

  /**
   * Configura los listeners para eventos internos
   */
  private setupEventListeners(): void {
    this.on('data-received', (line: string) => {
      // Procesar línea para el estado del tablero
      this.tableManager.processTableData(line);
      
      // Procesar mensajes de estado
      this.responseProcessor.processStatusMessage(line);
      
      // Agregar a buffer de respuesta
      this.responseProcessor.processLine(line);
    });
  }

  /**
   * Obtiene la instancia única del gestor serial
   */
  public static getInstance(): ArduinoSerialManager {
    if (!ArduinoSerialManager.instance) {
      ArduinoSerialManager.instance = new ArduinoSerialManager();
    }
    return ArduinoSerialManager.instance;
  }

  /**
   * Envía un comando al Arduino y espera la respuesta completa
   * @param command Comando a enviar
   * @returns Promise con el resultado de la operación y los datos recibidos
   */
  public async sendCommand(command: string): Promise<ArduinoResponse> {
    if (!this.serialConnection.isArduinoConnected()) {
      return { 
        success: false, 
        response: ['ERROR: No hay conexión con Arduino'] 
      };
    }

    // Preparar para recepción de respuesta
    this.responseProcessor.startWaiting();

    // Crear promesa para manejar la respuesta
    const responsePromise = new Promise<string[]>((resolve) => {
      // Evento único para recibir la respuesta completa
      const responseHandler = (responseData: string[]) => {
        this.removeListener('response-complete', responseHandler);
        clearTimeout(timeoutId);
        resolve(responseData);
      };
      
      // Configurar temporizador de espera
      const timeoutId = setTimeout(() => {
        this.removeListener('response-complete', responseHandler);
        const responseData = this.responseProcessor.cancelWaiting();
        resolve(responseData.length > 0 ? responseData : ['ERROR: Tiempo de espera agotado']);
      }, 5000); // 5 segundos de timeout
      
      // Registrar el manejador de respuestas
      this.on('response-complete', responseHandler);
    });

    // Enviar el comando
    const sendSuccess = await this.serialConnection.sendCommand(command);
    
    if (!sendSuccess) {
      return { 
        success: false, 
        response: ['ERROR: Fallo al enviar comando'] 
      };
    }
    
    // Esperar por la respuesta
    const response = await responsePromise;
    
    // Determinar éxito basado en respuesta
    const success = this.responseProcessor.isSuccessResponse(response);
    
    return { success, response };
  }

  /**
   * Obtiene el estado actual del tablero
   */
  public getCurrentTableState() {
    return this.tableManager.getCurrentState();
  }

  /**
   * Verifica si hay conexión con Arduino
   */
  public isArduinoConnected(): boolean {
    return this.serialConnection.isArduinoConnected();
  }

  /**
   * Cierra la conexión con Arduino
   */
  public async closeConnection(): Promise<boolean> {
    return this.serialConnection.close();
  }
}

// Exportamos la instancia única
export const arduinoSerial = ArduinoSerialManager.getInstance();