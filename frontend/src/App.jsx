import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Importamos React Router
import HomePage from "./pages/Home"; 
import GamePage from './pages/GamePage';  // Página del juego
import Top5Page from './pages/Top5Page'; // Importa la nueva página

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Página de inicio */}
        <Route path="/Juego" element={<GamePage />} />  {/* Página del juego */}
        <Route path="/top5" element={<Top5Page />} /> {/* Ruta a la página de Top 5 */}
      </Routes>
    </Router>
  );
}

export default App;
