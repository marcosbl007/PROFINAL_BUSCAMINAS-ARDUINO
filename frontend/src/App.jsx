import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Importamos React Router
import HomePage from './pages/Homepage';  // Página de inicio
import GamePage from './pages/GamePage';  // Página del juego

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />  {/* Página principal */}
        <Route path="/Juego" element={<GamePage />} />  {/* Página del juego */}
      </Routes>
    </Router>
  );
}

export default App;
