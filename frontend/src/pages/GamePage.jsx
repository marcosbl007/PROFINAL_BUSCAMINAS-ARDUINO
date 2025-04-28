import React, { useState, useRef } from 'react';
import axios from 'axios';
import './GamePage.css';

const GamePage = () => {
  const [bombPositions, setBombPositions] = useState([]); // Posiciones de las bombas
  const [loading, setLoading] = useState(false);
  const [gameStatus, setGameStatus] = useState('configurando'); // Estado del juego
  const [bombsVisible, setBombsVisible] = useState(true); // Variable para controlar la visibilidad de las bombas
  const [clickedCells, setClickedCells] = useState(Array(16).fill(false)); // Estado para saber qué celdas han sido clickeadas
  const [cellColors, setCellColors] = useState(Array(16).fill('')); // Colores de las celdas (verde, rojo o vacío)
  const [manualConfig, setManualConfig] = useState(false); // Control para saber si el usuario está configurando manualmente

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
        // Establecer los colores de las celdas dependiendo de si tienen bomba
        setCellColors(generateCellColors(response.data.bombPositions)); // Establecer colores de celdas
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generar colores para las celdas
  const generateCellColors = (bombPositions) => {
    return Array(16).fill('').map((_, index) => {
      return bombPositions.includes(index + 1) ? 'bomb' : ''; // Rojo si tiene bomba, vacío si no
    });
  };

  // Crear el tablero de 4x4
  const generateBoard = () => {
    const cells = [];
    for (let i = 0; i < 16; i++) {
      const hasBomb = bombPositions.includes(i + 1); // La respuesta del backend tiene posiciones 1-16
      const isClicked = clickedCells[i]; // Comprobar si la celda ha sido clickeada
      const cellStyle = cellColors[i]; // Obtener el color de la celda

      cells.push(
        <div
          key={i}
          className={`board-cell ${cellStyle}`}
          onClick={() => handleCellClick(i, hasBomb)} // Llamar a la función de clic
        >
          {/* Mostrar la bomba solo si hay bomba y las bombas son visibles */}
          {isClicked && hasBomb && !bombsVisible && (
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

  // Función para manejar el clic en una celda
  const handleCellClick = async (index, hasBomb) => {
    if (gameStatus === 'jugando' && !clickedCells[index]) {
      // Si estamos configurando manualmente
      if (manualConfig) {
        // Cambiar el color de la celda a rojo
        let newCellColors = [...cellColors];
        newCellColors[index] = 'bomb'; // Marca la celda como una bomba
        setCellColors(newCellColors);

        // Agregar la bomba al backend
        try {
          const response = await axios.post('http://localhost:3000/api/addBomb', {
            position: index + 1, // Mandamos la posición en formato 1-16
          });

          if (response.data.success) {
            console.log(`Bomba agregada en la posición ${index + 1}`);
            setBombPositions(prevPositions => [...prevPositions, index + 1]); // Actualizamos el estado con la nueva bomba
          } else {
            console.error('Error al agregar la bomba');
          }
        } catch (error) {
          console.error('Error al agregar la bomba:', error);
        }
        return; // Detenemos el flujo si estamos configurando manualmente
      }

      // Si no estamos configurando manualmente, procedemos normalmente
      let newClickedCells = [...clickedCells];
      newClickedCells[index] = true;
      setClickedCells(newClickedCells);

      // Enviar el movimiento al backend
      try {
        const response = await axios.post('http://localhost:3000/api/player/move', {
          position: index + 1, // Mandamos la posición en formato 1-16
        });

        // Si el movimiento fue exitoso, cambiar el color de la celda
        if (response.data.success) {
          // Cambiar color dependiendo si hay bomba o no
          let newCellColors = [...cellColors];
          if (hasBomb) {
            newCellColors[index] = 'bomb'; // Rojo si hay bomba
          } else {
            newCellColors[index] = 'safe'; // Verde si no hay bomba
          }
          setCellColors(newCellColors);

          // Si hay bomba, cambiar el estado del juego a "game over"
          if (hasBomb) {
            setGameStatus('game over');
            alert('¡Perdiste! Has tocado una bomba.');
            return; // Detenemos el flujo después de perder
          }

          // Verificar si el jugador ha ganado
          if (checkWin()) {
            setGameStatus('win');
            alert('¡Felicidades, ganaste!');
          }
        } else {
          console.error('Error al registrar el movimiento');
        }
      } catch (error) {
        console.error('Error al enviar el movimiento:', error);
      }
    }
  };

  // Función para verificar si el jugador ha ganado
  const checkWin = () => {
    for (let i = 0; i < 16; i++) {
      if (!bombPositions.includes(i + 1) && !clickedCells[i]) {
        return false; // Si hay alguna casilla sin bomba que no se haya clickeado, no ha ganado
      }
    }
    return true; // Si todas las casillas sin bomba han sido clickeadas, el jugador ha ganado
  };

  // Cambiar el estado del juego a "jugando"
  const handleStartGame = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/game', { status: 'jugando' });

      if (response.data.success) {
        setGameStatus('jugando');  // Actualizamos el estado del juego
        setBombsVisible(false);  // Ocultamos las bombas
        // Resetear los colores de las celdas, ya que las bombas ya no deben ser visibles
        setCellColors(Array(16).fill(''));
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
        setClickedCells(Array(16).fill(false)); // Reiniciar el estado de las celdas
        setCellColors(Array(16).fill('')); // Resetear los colores de las celdas

        // Limpiar el input de archivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';  // Limpiar el input de archivo
        }
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
              Iniciar Juego
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
            <button className="game-button animate-click" onClick={() => setManualConfig(!manualConfig)}>
              Configurar Manualmente
            </button>
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
