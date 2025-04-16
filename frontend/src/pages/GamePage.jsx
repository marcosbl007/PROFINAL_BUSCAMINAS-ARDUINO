import React, { useRef } from 'react';
import './GamePage.css';

const GamePage = () => {
  // Crear el tablero de 4x4
  const generateBoard = () => {
    const cells = [];
    for (let i = 0; i < 16; i++) {
      cells.push(
        <div key={i} className="board-cell">
          {/*lógica aquí para mostrar contenido en cada celda */}
        </div>
      );
    }
    return cells;
  };

  // Ref para el input de archivo
  const fileInputRef = useRef(null);

  // Función para manejar el cambio de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Archivo seleccionado: ${file.name}`);
      // Puedes agregar más lógica para trabajar con el archivo aquí
    }
  };

  return (
    <div className="background-container">
      {/* Panel transparente centrado */}
      <div className="center-panel">
        <h1 className="panel-title">Buscaminas</h1>
        <div className="game-layout">
          {/* Tablero */}
          <div className="board-container">
            {generateBoard()}
          </div>
          {/* Contenedor de botones */}
          <div className="button-container">
            <button className="game-button animate-click">Enviar</button>
            <button className="game-button animate-click">Nuevo Juego</button>
            {/* Botón para seleccionar archivos */}
            <label htmlFor="file-input" className="game-button animate-click">
              Seleccionar Archivo (.org)
            </label>
            <input
              ref={fileInputRef}
              id="file-input"
              type="file"
              accept=".org"
              onChange={handleFileSelect}
              style={{ display: 'none' }} // Ocultar el input original
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
