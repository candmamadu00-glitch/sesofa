import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RelatorioFinanceiro = ({ clienteId }) => {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/estatisticas/${clienteId}`);
        setDados(res.data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas");
      }
    };
    if (clienteId) fetchDados();
  }, [clienteId]);

  if (!dados) return <p style={{textAlign: 'center', padding: '20px'}}>Carregando indicadores financeiros...</p>;

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginTop: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h3 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '20px' }}>Resumo de Faturamento (CFA)</h3>
      
      {/* Cards de Resumo com cores da Guiné-Bissau */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={cardMini('#009E49')}>
          <span style={{fontSize: '12px', opacity: 0.9}}>Receitas</span>
          <p style={{margin: '5px 0 0 0', fontSize: '18px'}}>{dados.receitas.toLocaleString()} CFA</p>
        </div>
        <div style={cardMini('#CE1126')}>
          <span style={{fontSize: '12px', opacity: 0.9}}>Despesas</span>
          <p style={{margin: '5px 0 0 0', fontSize: '18px'}}>{dados.despesas.toLocaleString()} CFA</p>
        </div>
        <div style={cardMini('#FCD116')}>
          <span style={{fontSize: '12px', color: 'black', opacity: 0.8}}>Saldo Atual</span>
          <p style={{margin: '5px 0 0 0', fontSize: '18px', color: 'black'}}>{dados.saldo.toLocaleString()} CFA</p>
        </div>
      </div>

      {/* Gráfico de Barras Profissional */}
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={dados.dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: '#f5f5f5'}} />
            <Bar dataKey="valor" radius={[5, 5, 0, 0]} barSize={60}>
              {dados.dadosGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Receitas' ? '#009E49' : '#CE1126'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const cardMini = (color) => ({
  background: color,
  color: 'white',
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'center',
  minWidth: '140px',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
});

export default RelatorioFinanceiro;