import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Selecao from './pages/Selecao';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import PainelCliente from './pages/PainelCliente';
import PainelAdmin from './pages/PainelAdmin';
import RecuperarSenha from './pages/RecuperarSenha';
import ProjetoX from './components/ProjetoX';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Selecao />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar" element={<RecuperarSenha />} />
          <Route path="/painel-cliente" element={<PainelCliente />} />
          <Route path="/painel-admin" element={<PainelAdmin />} />
        </Routes>
        
        {/* Assistente Projeto X */}
        <ProjetoX />
      </div>
    </Router>
  );
}

export default App;