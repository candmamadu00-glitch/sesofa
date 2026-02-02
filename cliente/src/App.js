import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Selecao from './pages/Selecao'; // ADICIONE ESTA LINHA
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import PainelCliente from './pages/PainelCliente';
import PainelAdmin from './pages/PainelAdmin';
import RecuperarSenha from './pages/RecuperarSenha';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Selecao />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar" element={<RecuperarSenha />} />
        <Route path="/painel-cliente" element={<PainelCliente />} />
        <Route path="/painel-admin" element={<PainelAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;