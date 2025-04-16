import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("Rutas disponibles:");
  console.log("- GET  /api/status --> Server Status");
  console.log("- POST  /api/upload --> Cargar FILE");
  console.log("- POST /api/addBomb --> Añadir bomba --> { position: 1-16 } --> foramto JSON");
  console.log("- *GET /api/satusGame --> Estado del juego --> { status: 'configurando/jugando/reiniciar' } --> formato JSON");
  console.log("- *POST /api/satusGame --> Cambiar Estado del juego --> { status: 'configurando/jugando/reiniciar' } --> formato JSON");
  console.log("- *GET /api/puntajes --> Tabla de puntuaciones --> { 1-2-3-4-5 } --> formato JSON");
  console.log("- POST /api/reset/table --> Resetear solo el tablero (mantiene puntajes)");
  console.log("- POST /api/reset/factory --> Resetear completamente el sistema (tablero, top 5, puntaje)");
  console.log("- GET  /api/arduino/status --> Verificar conexión con Arduino");
  console.log("- **POST /api/arduino/command --> Controlar Arduino --> { command: '0'/'1' } --> formato JSON");
});