import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RelatorioFinanceiro = ({ clienteId }) => {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/estatisticas/${clienteId}`);
        setDados(res.data.dadosGrafico);
      } catch (err) {
        console.error("Erro ao buscar dados do gráfico", err);
      }
    };
    if (clienteId) fetchDados();
  }, [clienteId]);

  return (
    <div style={{ width: '100%', height: 350, background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '20px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Resumo Financeiro (CFA)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={{fill: '#f5f5f5'}} />
          <Legend />
          <Bar dataKey="valor" fill="#2e7d32" name="Valor em CFA" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RelatorioFinanceiro;