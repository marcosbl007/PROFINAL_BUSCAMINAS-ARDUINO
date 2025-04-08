#include <EEPROM.h>

// ======================
// DEFINICIÓN DE ESTRUCTURA
// ======================
#define DIR_TABLERO   0   // 16 bytes (4x4)
#define DIR_TOP5      16  // 10 bytes (5 x uint16_t)
#define DIR_ESTADO    26  // 3 bytes (puntaje + flags)
#define DIR_CHECKSUM  29  // 1 byte (verificación)

// Estructura para el estado del juego
struct EstadoJuego {
  uint16_t puntaje;       // 2 bytes
  byte flags;             // 1 byte (bit 0: juego activo, bit 1: ganó)
};

// Variables para la comunicación serial
String inputString = "";         // String para almacenar la entrada
boolean stringComplete = false;  // Bandera para indicar si el string está completo

// Tablero de juego en memoria
bool tablero[16] = {0};

// ======================
// FUNCIONES PRINCIPALES
// ======================

// Guarda el tablero (usa update para minimizar escrituras)
void guardarTablero(bool tablero[16]) {
  for (int i = 0; i < 16; i++) {
    EEPROM.update(DIR_TABLERO + i, tablero[i] ? 1 : 0);
  }
  actualizarChecksum();
}

// Carga el tablero desde EEPROM
void cargarTablero(bool tablero[16]) {
  for (int i = 0; i < 16; i++) {
    tablero[i] = EEPROM.read(DIR_TABLERO + i) == 1;
  }
}

// Guarda un nuevo puntaje en el top 5 (si califica)
void guardarPuntajeTop(uint16_t nuevoPuntaje) {
  // Implementación omitida para simplificar
}

// Guarda el estado del juego
void guardarEstado(EstadoJuego estado) {
  EEPROM.put(DIR_ESTADO, estado);
  actualizarChecksum();
}

// ======================
// FUNCIONES AUXILIARES
// ======================

// Calcula checksum XOR simple
byte calcularChecksum() {
  byte checksum = 0;
  for (int i = 0; i < DIR_CHECKSUM; i++) {
    checksum ^= EEPROM.read(i);
  }
  return checksum;
}

// Actualiza el checksum
void actualizarChecksum() {
  EEPROM.update(DIR_CHECKSUM, calcularChecksum());
}

// Verifica integridad de datos
bool datosValidos() {
  return EEPROM.read(DIR_CHECKSUM) == calcularChecksum();
}

// Añade esta nueva función para reset parcial (solo tablero)
void resetTablero() {
  // Tablero vacío
  for (int i = 0; i < 16; i++) {
    tablero[i] = false;  // Limpiar la copia en memoria
    EEPROM.update(DIR_TABLERO + i, 0); // Escribir directamente en EEPROM
  }
  
  // Estado inicial del juego (manteniendo puntaje)
  EstadoJuego estado;
  EEPROM.get(DIR_ESTADO, estado);
  estado.flags = 0;  // Reiniciar flags pero mantener puntaje
  EEPROM.put(DIR_ESTADO, estado);
  
  // Actualizar checksum
  actualizarChecksum();
}

// Mantén la función inicializarEEPROM() como estaba (para reset completo)
void inicializarEEPROM() {
  // Tablero vacío
  for (int i = 0; i < 16; i++) {
    tablero[i] = false;  // Limpiar la copia en memoria
    EEPROM.update(DIR_TABLERO + i, 0); // Escribir directamente sin calcular checksum cada vez
  }
  
  // Top 5 inicial
  uint16_t top5Inicial[5] = {0, 0, 0, 0, 0};
  EEPROM.put(DIR_TOP5, top5Inicial);
  
  // Estado inicial
  EstadoJuego estadoInicial;
  estadoInicial.puntaje = 0;
  estadoInicial.flags = 0;
  EEPROM.put(DIR_ESTADO, estadoInicial);
  
  // Calcular checksum una sola vez al final
  actualizarChecksum();
}

// ======================
// AGREGAR BOMBA
// ======================

// Añade una bomba en la posición especificada
void addBombToTable(int position) {
  // Verificar que la posición sea válida (1-16)
  if (position < 1 || position > 16) {
    Serial.print("ERROR: Posición fuera de rango: ");
    Serial.println(position);
    Serial.println("END_RESPONSE"); // IMPORTANTE: Añadir END_RESPONSE aquí
    return;
  }
  
  // Ajustar a índice base 0
  int index = position - 1;
  
  // Verificar si ya hay una bomba en esa posición
  if (tablero[index]) {
    Serial.print("WARN: Ya existe una bomba en posición: ");
    Serial.println(position);
    Serial.println("END_RESPONSE"); // IMPORTANTE: Añadir END_RESPONSE aquí
    return;
  }
  
  // Marcar la posición como ocupada (con bomba)
  tablero[index] = true;
  
  // Guardar en EEPROM
  guardarTablero(tablero);
  
  // Enviar confirmación
  Serial.print("OK: Bomba agregada en posición: ");
  Serial.println(position);
  
  // Mostrar el estado actual del tablero
  mostrarTablero();
  // No necesita END_RESPONSE aquí porque mostrarTablero() ya lo envía
}

// Muestra el tablero por serial para depuración
void mostrarTablero() {
  Serial.println("Estado del tablero:");
  for (int i = 0; i < 16; i++) {
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.println(tablero[i] ? "1" : "0");
  }
  // Enviar fin de respuesta para que el backend sepa que terminamos
  Serial.println("END_RESPONSE");
}

// Procesa los comandos recibidos por serial
void procesarComando(String comando) {
  comando.trim(); // Eliminar espacios en blanco
  
  // Verificar que el comando tenga al menos 1 carácter
  if (comando.length() < 1) {
    Serial.println("ERROR: Comando vacío");
    Serial.println("END_RESPONSE"); // IMPORTANTE: Añadir END_RESPONSE aquí
    return;
  }
  
  // Primer carácter indica el tipo de comando
  char tipo = comando.charAt(0);
  
  // Para diagnóstico
  Serial.print("Tipo de comando: ");
  Serial.println(tipo);
  
  // Extraer el resto como valor (normalmente un número)
  String valorStr = comando.substring(1);
  int valor = valorStr.toInt();
  
  Serial.print("Valor: ");
  Serial.println(valor);
  
  // Comando de prueba simple
  if (tipo == 'T') {
    Serial.println("TEST: Comando de prueba recibido correctamente");
    Serial.println("END_RESPONSE");
    return;
  }
    
  // En la sección de procesamiento de comandos, modifica el switch:
  switch (tipo) {
    case 'B': // Agregar bomba
      addBombToTable(valor);
      break;
    
    case 'R': // Reset parcial (solo tablero)
      Serial.println("Reiniciando tablero...");
      resetTablero();
      Serial.println("OK: Tablero reiniciado");
      mostrarTablero();
      break;
    
    case 'F': // Reset completo (factory reset)
      Serial.println("Reiniciando sistema completo...");
      inicializarEEPROM();
      Serial.println("OK: Sistema reiniciado completamente");
      mostrarTablero();
      break;
    
    case 'S': // Estado del juego
      mostrarTablero();
      break;
        
    default:
      Serial.print("ERROR: Tipo de comando desconocido: ");
      Serial.println(tipo);
      Serial.println("END_RESPONSE");
  }
}

void setup() {
  // Inicializar comunicación serial
  Serial.begin(9600);
  delay(1000); // Dar tiempo para que se establezca la comunicación
  
  Serial.println("Sistema de juego iniciado");
  Serial.println("END_RESPONSE"); // Para que no se quede esperando al inicio
  
  // Inicializar strings para comunicación
  inputString.reserve(20); // Aumentar el tamaño por seguridad
}

void loop() {
  // Procesar comandos completos
  if (stringComplete) {
    // Confirmar recepción del comando inmediatamente
    Serial.print("Recibido comando: '");
    Serial.print(inputString);
    Serial.println("', procesando...");
    
    procesarComando(inputString);
    
    // Limpiar el string y la bandera
    inputString = "";
    stringComplete = false;
  }
}

// Procesar evento de recepción serial
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    // Si llega un salto de línea o retorno de carro, el string está completo
    if (inChar == '\n' || inChar == '\r') {
      if (inputString.length() > 0) { // Solo marcar como completo si hay datos
        stringComplete = true;
      }
    } else {
      // Agregar caracter al string
      if (inputString.length() < 19) { // Prevenir desbordamiento
        inputString += inChar;
      }
    }
  }
}