import React, { useState, useRef } from 'react';
import axios from 'axios';
import './GamePage.css';

const GamePage = () => {
  const [bombPositions, setBombPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gameStatus, setGameStatus] = useState('configurando'); // Estado del juego
  const [bombsVisible, setBombsVisible] = useState(true); // Variable para controlar la visibilidad de las bombas

  // Ref para el input de archivo
  const fileInputRef = useRef(null);

  // Función para manejar el cambio de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Archivo seleccionado: ${file.name}`);
      uploadFile(file);
    }
  };

  // Función para enviar el archivo al backend
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Asumimos que la respuesta incluye un arreglo de posiciones de las bombas
      if (response.data.success) {
        setBombPositions(response.data.bombPositions); // Actualizamos el estado de las bombas
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crear el tablero de 4x4
  const generateBoard = () => {
    const cells = [];
    for (let i = 0; i < 16; i++) {
      const hasBomb = bombPositions.includes(i + 1); // La respuesta del backend tiene posiciones 1-16
      cells.push(
        <div key={i} className={`board-cell ${hasBomb && bombsVisible ? 'bomb' : ''}`}>
          {/* Mostrar la bomba solo si hay bomba y las bombas son visibles */}
          {hasBomb && bombsVisible && (
            <img
              src="https://openui.fly.dev/openui/100x100.svg?text=💣"
              alt="Bomba"
              className="bomb-image"
            />
          )}
        </div>
      );
    }
    return cells;
  };

  // Cambiar el estado del juego a "jugando"
  const handleStartGame = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/game', { status: 'jugando' });

      if (response.data.success) {
        setGameStatus('jugando');  // Actualizamos el estado del juego
        setBombsVisible(false);  // Ocultamos las bombas
      } else {
        console.error('Error al cambiar el estado del juego');
      }
    } catch (error) {
      console.error('Error al cambiar el estado del juego:', error);
    }
  };

  // Función para reiniciar el juego
  const handleNewGame = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/reset/table');
      
      if (response.data.success) {
        console.log('Tablero reiniciado exitosamente');
        setBombPositions([]); // Limpiar las posiciones de las bombas
        setBombsVisible(true); // Mostrar las bombas de nuevo
        setGameStatus('configurando'); // Cambiar el estado del juego a "configurando"
      } else {
        console.error('Error al reiniciar el tablero');
      }
    } catch (error) {
      console.error('Error al reiniciar el tablero:', error);
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
            <button className="game-button animate-click" onClick={handleStartGame}>
              Enviar
            </button>
            <button className="game-button animate-click" onClick={handleNewGame}>
              Nuevo Juego
            </button>

            {/* Botón para seleccionar archivos */}
            <label htmlFor="file-input" className="game-button animate-click">
              Seleccionar Archivo
            </label>
            <input
              ref={fileInputRef}
              id="file-input"
              type="file"
              accept=".org"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {/* Nuevos botones */}
            <button className="game-button animate-click">Configurar Manualmente</button>
            <button
              className="game-button animate-click"
              onClick={() => window.location.href = '/top5'}
            >
              Top 5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
