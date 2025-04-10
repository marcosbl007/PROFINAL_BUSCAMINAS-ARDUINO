#include <EEPROM.h>

// ======================
// CONFIGURACIÓN DE PINES
// ======================



#define PIN_LED_JUGANDO      2
#define PIN_LED_GANASTE      3
#define PIN_LED_GAMEOVER     4


// ======================
// DEFINICIÓN DE ESTRUCTURA
// ======================
#define DIR_TABLERO   0   // 16 bytes (4x4)
#define DIR_TOP5      16  // 10 bytes (5 x uint16_t)
#define DIR_ESTADO    26  // 3 bytes (puntaje + flags)
#define DIR_CHECKSUM  29  // 1 byte (verificación)
#define ESTADO_CONFIGURANDO 0
#define ESTADO_JUGANDO      1

// Variable para el estado actual del juego
byte estadoJuegoActual = ESTADO_CONFIGURANDO; // Por defecto, se inicia en modo configuración


// Estructura para el estado del juego
struct EstadoJuego {
  uint16_t puntaje;       // 2 bytes
  byte flags;             // 1 byte (bit 0: juego activo, bit 1: perdió/game over, bit 2: ganó)
};

// Variables para la comunicación serial
String inputString = "";         // String para almacenar la entrada
boolean stringComplete = false;  // Bandera para indicar si el string está completo
EstadoJuego estadoActual;  // Estado actual del juego
uint16_t Score = 0;        // Variable para seguimiento del puntaje

// Tablero de juego en memoria
bool tablero[16] = {0};         // Posiciones con bombas
bool verificadas[16] = {0};     // Posiciones ya verificadas

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
  // Leer los puntajes actuales
  uint16_t top5[5];
  EEPROM.get(DIR_TOP5, top5);
  
  // Verificar si el nuevo puntaje califica para el top 5
  bool califica = false;
  int posicion = -1;
  
  // Encontrar la posición donde insertar (si califica)
  for (int i = 0; i < 5; i++) {
    if (nuevoPuntaje > top5[i]) {
      califica = true;
      posicion = i;
      break;
    }
  }
  
  // Si califica, insertar en la posición correcta y desplazar el resto
  if (califica) {
    for (int i = 4; i > posicion; i--) {
      top5[i] = top5[i-1];
    }
    top5[posicion] = nuevoPuntaje;
    
    // Guardar el nuevo top 5
    EEPROM.put(DIR_TOP5, top5);
    actualizarChecksum();
    
    Serial.print("¡Felicidades! Tu puntaje ");
    Serial.print(nuevoPuntaje);
    Serial.print(" quedó en la posición #");
    Serial.println(posicion + 1);
  }
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



// ======================
// FUNCIONES DE RESET
// ======================

void resetTablero() {
  // Tablero vacío
  for (int i = 0; i < 16; i++) {
    tablero[i] = false;
    verificadas[i] = false;
    EEPROM.update(DIR_TABLERO + i, 0);
  }
  
  // Reiniciar estado y score
  estadoActual.flags = 0;
  actualizarLEDs();  // Añadir esta línea
  Score = 0;
  estadoActual.puntaje = 0;
  EEPROM.put(DIR_ESTADO, estadoActual);
  
  // Volver a modo configuración
  estadoJuegoActual = ESTADO_CONFIGURANDO;
  
  // Actualizar checksum
  actualizarChecksum();
}

// Reset completo
void inicializarEEPROM() {
  // Tablero vacío
  for (int i = 0; i < 16; i++) {
    tablero[i] = false;     // Limpiar la copia en memoria
    verificadas[i] = false; // Reiniciar verificaciones
    EEPROM.update(DIR_TABLERO + i, 0); 
  }
  
  // Top 5 inicial
  uint16_t top5Inicial[5] = {0, 0, 0, 0, 0};
  EEPROM.put(DIR_TOP5, top5Inicial);
  
  // Estado inicial
  EstadoJuego estadoInicial;
  estadoInicial.puntaje = 0;
  estadoInicial.flags = 0;
  estadoActual.flags = 0;
  actualizarLEDs(); 
  EEPROM.put(DIR_ESTADO, estadoInicial);
  
  // Calcular checksum una sola vez al final
  actualizarChecksum();
}

// ======================
// AGREGAR BOMBA
// ======================

// Añade una bomba en la posición especificada
void addBombToTable(int position) {

  if (estadoJuegoActual != ESTADO_CONFIGURANDO) {
    Serial.println("ERROR: No se pueden agregar bombas en modo JUGANDO");
    Serial.println("END_RESPONSE");
    return;
  }
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
  Serial.println("OK: Estado del tablero:");
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
      Serial.println("OK: Reiniciando tablero...");
      resetTablero();
      Serial.println("OK: Tablero reiniciado");
      mostrarTablero();
      break;
    
    case 'F': // Reset completo (factory reset)
      Serial.println("OK: Reiniciando sistema completo...");
      inicializarEEPROM();
      // Asegurar que el estado cambie a CONFIGURANDO
      estadoJuegoActual = ESTADO_CONFIGURANDO;
      Score = 0; // Reiniciar el puntaje explícitamente
      Serial.println("OK: Sistema reiniciado completamente");
      Serial.println("OK: Estado cambiado a: CONFIGURANDO");
      mostrarTablero();
      Serial.println("END_RESPONSE");
      break;
    
    case 'S': // Estado del juego
      mostrarTableroJugador();
      break;

    case 'U': //Usuario Movimiento
      verificarBomba(valor); 
      
      break;

    case 'P': // Mostrar TOP5
      mostrarTop5();
      break;

    case 'E': // Cambiar estado del juego
      if (valor == 0) {
        // Cambiar a modo configuración
        estadoJuegoActual = ESTADO_CONFIGURANDO;
        Serial.println("OK: Estado cambiado a: CONFIGURANDO");
        Serial.println("END_RESPONSE");
      } 
      else if (valor == 1) {
        // Verificar si hay bombas configuradas antes de permitir jugar
        if (!hayBombasConfiguradas()) {
          Serial.println("ERROR: No hay bombas configuradas. Debes colocar al menos una bomba.");
          Serial.println("END_RESPONSE");
          return;
        }
        
        // Cambiar a modo juego
        estadoJuegoActual = ESTADO_JUGANDO;
        Serial.println("OK: Estado cambiado a: JUGANDO");
        Serial.println("END_RESPONSE");
      }
      else {
        Serial.print("ERROR: Estado desconocido: ");
        Serial.println(valor);
        Serial.println("END_RESPONSE");
      }
      break;

        
    default:
      Serial.print("ERROR: Tipo de comando desconocido: ");
      Serial.println(tipo);
      Serial.println("END_RESPONSE");
  }
}

//CODIGO DE VERIFICACION DE BOMBA

// Verifica si hay al menos una bomba configurada
bool hayBombasConfiguradas() {
  for (int i = 0; i < 16; i++) {
    if (tablero[i]) {
      return true; // Al menos hay una bomba
    }
  }
  return false; // No hay bombas
}

void verificarBomba(int position) {
  // Verificar que el juego esté en modo JUGANDO
  if (estadoJuegoActual != ESTADO_JUGANDO) {
    Serial.println("ERROR: No se pueden verificar posiciones en modo CONFIGURACIÓN");
    Serial.println("END_RESPONSE");
    return;
  }
  
  // Verificar si el juego ya terminó
  if ((estadoActual.flags & 0x06) != 0) { // 0x06 = bit 1 (perdió) o bit 2 (ganó)
    Serial.println("ERROR: El juego ya terminó. Reinicie el tablero para jugar de nuevo.");
    Serial.println("END_RESPONSE");
    return;
  }
  
  // El resto del código existente...  // Verificar que la posición sea válida (1-16)
  if (position < 1 || position > 16) {
    Serial.print("ERROR: Posición fuera de rango: ");
    Serial.println(position);
    Serial.println("END_RESPONSE"); 
    return;
  }
  
  // Ajustar a índice base 0
  int index = position - 1;
  
  // Verificar si ya se comprobó esta posición
  if (verificadas[index]) {
    Serial.print("WARN: Esta posición ya fue verificada: ");
    Serial.println(position);
    Serial.println("END_RESPONSE");
    return;
  }
  
  // Marcar la posición como verificada
  verificadas[index] = true;
  
  // Verificar si hay una bomba en esa posición
  if (tablero[index]) {
    Serial.print("UNA BOMBA: GAME OVER en posición: ");
    Serial.println(position);
    
    // Actualizar estado y guardar puntaje en TOP5
    estadoActual.flags |= 0x02;  // Marcar como juego perdido
    guardarPuntajeTop(Score);    // Guardar en TOP5
    actualizarLEDs();  // Añadir esta línea
    
    // Guardar estado en EEPROM
    guardarEstado(estadoActual);
    
    // Mostrar puntaje final
    Serial.print("Puntaje final: ");
    Serial.println(Score);
    
    Serial.println("END_RESPONSE");
    return;
  }
    
  // Si no hay bomba, incrementar puntaje
  Score++;
  estadoActual.puntaje = Score;
  
  // Guardar estado actualizado
  guardarEstado(estadoActual);
  
  // Enviar confirmación
  Serial.print("OK: No hay bomba en posición: ");
  Serial.println(position);
  Serial.println("+1 PUNTO");
  Serial.print("Score actual: "); 
  Serial.println(Score); 
  
  // Verificar si el jugador ha ganado (todas las casillas sin bombas están verificadas)
  if (verificarVictoria()) {
    Serial.println("¡FELICIDADES! ¡HAS GANADO!");
    
    // Actualizar estado como juego ganado
    estadoActual.flags |= 0x04;  // Bit 2 para indicar victoria
    actualizarLEDs();  // Añadir esta línea
    // Guardar puntaje en TOP5
    guardarPuntajeTop(Score);
    
    // Guardar estado actualizado
    guardarEstado(estadoActual);
  }
  
  // Mostrar el estado actual del tablero
  mostrarTableroJugador();
}

// Muestra la tabla de puntuaciones TOP5
void mostrarTop5() {
  uint16_t top5[5];
  EEPROM.get(DIR_TOP5, top5);
  
  Serial.println("=== TOP 5 PUNTAJES ===");
  for (int i = 0; i < 5; i++) {
    Serial.print(i + 1);
    Serial.print(". ");
    Serial.println(top5[i]);
  }
  Serial.println("=====================");
  Serial.println("END_RESPONSE");
}

// Verifica si el jugador ha ganado (todas las casillas seguras están verificadas)
bool verificarVictoria() {
  for (int i = 0; i < 16; i++) {
    // Si hay una casilla que no es bomba y no ha sido verificada, aún no ha ganado
    if (!tablero[i] && !verificadas[i]) {
      return false;
    }
  }
  return true;
}

// Muestra el tablero con información de casillas verificadas
void mostrarTableroJugador() {
  Serial.println("Estado del tablero:");
  for (int i = 0; i < 16; i++) {
    Serial.print(i + 1);
    Serial.print(": ");
    
    if (verificadas[i]) {
      // Si fue verificada, mostrar si tenía bomba o no
      Serial.println(tablero[i] ? "BOMBA" : "SEGURO");
    } else {
      // Si no ha sido verificada, mostrar como desconocida
      Serial.println("?");
    }
  }
  Serial.println("END_RESPONSE");
}

void actualizarLEDs() {
  // Apagar todos los LEDs primero
  digitalWrite(PIN_LED_JUGANDO, LOW);
  digitalWrite(PIN_LED_GANASTE, LOW);
  digitalWrite(PIN_LED_GAMEOVER, LOW);
  
  // Encender el LED según el estado de flags
  if (estadoActual.flags & 0x02) {         // Bit 1 - Game over
    digitalWrite(PIN_LED_GAMEOVER, HIGH);
  } 
  else if (estadoActual.flags & 0x04) {    // Bit 2 - Victoria
    digitalWrite(PIN_LED_GANASTE, HIGH);
  }
  else {                                   // Estado normal (incluye configurando y jugando)
    digitalWrite(PIN_LED_JUGANDO, HIGH);
  }
}

void setup() {
  // Inicializar comunicación serial
  Serial.begin(9600);
  delay(1000); // Dar tiempo para que se establezca la comunicación
  
  // Verificar integridad de datos y cargar estado
  if (!datosValidos()) {
    Serial.println("Datos corruptos o primer inicio. Inicializando EEPROM...");
    inicializarEEPROM();
  }
  
  // Cargar tablero y estado actual
  cargarTablero(tablero);
  EEPROM.get(DIR_ESTADO, estadoActual);
  Score = estadoActual.puntaje;
  actualizarLEDs();  // Añadir esta línea
  
  Serial.println("Sistema de juego iniciado");
  Serial.println("END_RESPONSE");
  
  // Inicializar strings para comunicación
  inputString.reserve(20);


    
    // Configurar los pines de LED como salida
    pinMode(PIN_LED_JUGANDO, OUTPUT);
    pinMode(PIN_LED_GANASTE, OUTPUT);
    pinMode(PIN_LED_GAMEOVER, OUTPUT);
    
    // Establecer estado inicial de LEDs
    actualizarLEDs();
  }
  
  // Función para actualizar LEDs según las flags



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