export interface TablePosition {
  position: number;
  hasBomb: boolean;
}

export interface ArduinoResponse {
  success: boolean;
  response: string[];
}

export interface SerialConfig {
  portName: string;
  baudRate: number;
}