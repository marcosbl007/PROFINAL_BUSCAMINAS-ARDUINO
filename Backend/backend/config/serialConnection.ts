import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { EventEmitter } from 'events';
import { SerialConfig } from './serialTypes';

export class SerialConnection {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private isConnected: boolean = false;
  
  constructor(
    private config: SerialConfig,
    private emitter: EventEmitter
  ) {}

  /**
   * Conecta con el Arduino en el puerto configurado
   */
  public connect(): void {
    try {
      this.port = new SerialPort({
        path: this.config.portName,
        baudRate: this.config.baudRate,
        autoOpen: false
      });

      this.port.open((err) => {
        if (err) {
          console.error('Error al abrir el puerto serial:', err);
          this.isConnected = false;
          this.emitter.emit('connection-error', err);
          return;
        }

        console.log(`Conexión establecida con Arduino en ${this.config.portName}`);
        this.isConnected = true;
        
        // Crear parser para dividir por líneas
        this.parser = this.port!.pipe(new ReadlineParser({ delimiter: '\r\n' }));
        
        // Manejar datos recibidos desde Arduino
        this.parser.on('data', (line: string) => {
          console.log('Arduino dice:', line);
          this.emitter.emit('data-received', line);
        });

        this.emitter.emit('connected');

        // Manejar errores
        this.port!.on('error', (err) => {
          console.error('Error en la comunicación serial:', err);
          this.isConnected = false;
          this.emitter.emit('error', err);
        });

        // Manejar cierre del puerto
        this.port!.on('close', () => {
          console.log('Conexión serial cerrada');
          this.isConnected = false;
          this.emitter.emit('disconnected');
        });
      });
    } catch (error) {
      console.error('Error al inicializar la conexión serial:', error);
      this.isConnected = false;
    }
  }

  /**
   * Envía un comando al puerto serial
   */
  public sendCommand(command: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isConnected || !this.port) {
        resolve(false);
        return;
      }

      this.port.write(command + '\n', (err) => {
        if (err) {
          console.error('Error al enviar comando a Arduino:', err);
          resolve(false);
          return;
        }
        
        console.log(`Comando "${command}" enviado a Arduino, esperando respuesta...`);
        resolve(true);
      });
    });
  }

  /**
   * Cierra la conexión con Arduino
   */
  public close(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.port) {
        resolve(true);
        return;
      }

      this.port.close((err) => {
        if (err) {
          console.error('Error al cerrar el puerto serial:', err);
          resolve(false);
          return;
        }
        
        console.log('Conexión con Arduino cerrada correctamente');
        this.isConnected = false;
        resolve(true);
      });
    });
  }

  /**
   * Verifica si hay conexión con Arduino
   */
  public isArduinoConnected(): boolean {
    return this.isConnected;
  }
}