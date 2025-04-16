import React from 'react';
import { useNavigate } from 'react-router-dom';  // Importamos useNavigate
import './HomePage.css';  // Asegúrate de importar los estilos de la página de inicio

const HomePage = () => {
  const navigate = useNavigate();  // Inicializamos el hook para redirigir

  // Función que se ejecuta al hacer clic en el botón
  const startGame = () => {
    navigate('/Juego');  // Redirige al usuario a la página del juego
  };

  return (
    <div className="background-container">
      {/* Panel transparente centrado */}
      <div className="center-panel">
        <h1 className="panel-title">Buscaminas</h1>
        <p className="panel-description">¡Presiona para comenzar!</p>
        <button className="panel-button" onClick={startGame}>
          Iniciar Juego
        </button>
        
        {/* Contenedor de la bomba */}
        <div className="bomb-container">
          <img
            src="https://openui.fly.dev/openui/100x100.svg?text=💣"  // Icono de la bomba
            alt="icono bomba"
            className="bomb-icon"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
