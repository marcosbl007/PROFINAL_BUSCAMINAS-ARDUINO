# Documentación de la API del Juego

## Endpoints Generales

### Verificar Estado del Servidor
- **GET /api/status**
- Respuesta: `{ status: "online", message: "API funcionando correctamente", timestamp: "fecha" }`

## Gestión del Tablero

### Cargar Archivo de Configuración
- **POST /api/upload**
- Formato: `multipart/form-data` con campo `file`
- Respuesta: `{ success: true, bombPositions: [1, 5, 9], arduino: { connected: true, commandResults: [] } }`
- El frontend debe de recibir y buscar en el json la parte de bombPosition

### Añadir Bomba
- **POST /api/addBomb**
- Cuerpo: `{ position: 5 }` (número entre 1-16)
- Respuesta: `{ success: true, message: "Se agregó la bomba en la posición 5", position: 5, tableroActual: [] }`

### Resetear Tablero
- **POST /api/reset/table**
- Respuesta: `{ success: true, message: "Tablero reseteado exitosamente" }`

### Resetear Sistema Completo
- **POST /api/reset/factory**
- Respuesta: `{ success: true, message: "Reset completo realizado exitosamente" }`

## Estado del Juego

### Obtener Estado del Juego
- **GET /api/game**
- Respuesta: `{ success: true, gameState: [false, true, ...] }` (array de 16 booleanos)

### Cambiar Estado del Juego
- **POST /api/game**
- Cuerpo: `{ status: "configurando" }` o `{ status: "jugando" }`
- Respuesta: `{ success: true, message: "Estado cambiado a jugando" }`

### Obtener Tabla de Puntuaciones
- **GET /api/game/scores**
- Respuesta: `{ success: true, scores: [10, 8, 5, 3, 1] }`

### Realizar Movimiento (Verificar Posición)
- **POST /api/game/move**
- Cuerpo: `{ position: 7 }` (número entre 1-16)
- Respuesta: `{ success: true, position: 7, gameOver: false, victory: false, score: 3 }`

## Arduino

### Verificar Conexión con Arduino
- **GET /api/arduino/status**
- Respuesta: `{ success: true, connected: true, message: "Arduino conectado" }`

### Enviar Comando a Arduino
- **POST /api/arduino/command**
- Cuerpo: `{ command: "P" }` (comando directo)
- Respuesta: `{ success: true, command: "P", response: ["=== TOP 5 PUNTAJES ===", "1. 10", ...] }`