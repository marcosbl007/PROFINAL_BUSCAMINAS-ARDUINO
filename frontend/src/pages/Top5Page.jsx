import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GamePage.css'; // Usamos el mismo archivo CSS para mantener los mismos estilos

const Top5Page = () => {
  // Definimos un estado para los 5 mejores puntajes
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener el Top 5 desde el backend
  const fetchTopScores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/scores');
      if (response.data.success) {
        setTopScores(response.data.scores); // Actualizamos los puntajes en el estado
      } else {
        console.error('Error al obtener los puntajes');
      }
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
    } finally {
      setLoading(false);
    }
  };

  // Llamar a la función fetchTopScores cuando el componente se monte
  useEffect(() => {
    fetchTopScores();
  }, []);

  // Función para reiniciar el Top 5 (puedes modificar esto para hacer una petición a la API)
  const handleResetTop = async () => {
    try {
      // Realizar una petición a la API para reiniciar el Top 5
      const response = await axios.post('http://localhost:3000/api/reset/factory');
      if (response.data.success) {
        setTopScores([0, 0, 0, 0, 0]); // Reiniciamos el top a valores de ejemplo
      } else {
        console.error('Error al reiniciar el Top 5');
      }
    } catch (error) {
      console.error('Error al reiniciar el Top 5:', error);
    }
  };

  // Función para volver al juego
  const handleBackToGame = () => {
    window.location.href = '/Juego'; // Redirige al juego
  };

  return (
    <div className="background-container">
      <div className="center-panel">
        <h1 className="panel-title">TOP 5</h1>
        <div className="top-scores">
          {loading ? (
            <p>Cargando...</p>
          ) : topScores.length === 0 ? (
            <p>No hay puntajes disponibles</p>
          ) : (
            topScores.map((score, index) => (
              <div key={index} className="top-score-item">
                {`#${index + 1} - ${score} puntos`}
              </div>
            ))
          )}
        </div>
        <div className="button-container">
          <button className="game-button animate-click" onClick={handleResetTop}>
            Reiniciar Top
          </button>
          <button
            className="game-button animate-click"
            onClick={handleBackToGame}
          >
            Volver al Juego
          </button>
        </div>
      </div>
    </div>
  );
};

export default Top5Page;
