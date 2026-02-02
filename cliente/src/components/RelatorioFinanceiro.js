import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';

const RelatorioFinanceiro = ({ clienteId }) => {
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });

  // Buscar dados do servidor
  const carregarDados = async () => {
    try {
      const res = await api.get(`/financeiro/${clienteId}`);
      setLancamentos(res.data);
      calcularTotais(res.data);
    } catch (err) {
      console.error("Erro ao buscar financeiro", err);
    }
  };

  useEffect(() => {
    if (clienteId) carregarDados();
  }, [clienteId]);

  // Calcular Saldo
  const calcularTotais = (dados) => {
    let receitas = 0;
    let despesas = 0;
    dados.forEach(item => {
      if (item.tipo === 'receita') receitas += item.valor;
      else despesas += item.valor;
    });
    setResumo({ receitas, despesas, saldo: receitas - despesas });
  };

  const deletarLancamento = async (id) => {
    if (!window.confirm("Apagar este lançamento?")) return;
    try {
      await api.delete(`/financeiro/${id}`);
      carregarDados();
    } catch (err) { alert("Erro ao deletar"); }
  };

  // Dados para o Gráfico
  const dadosGrafico = [
    { nome: 'Entradas', valor: resumo.receitas, cor: '#28a745' },
    { nome: 'Saídas', valor: resumo.despesas, cor: '#dc3545' }
  ];

  return (
    <div>
      {/* CARDS DE RESUMO */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <div style={{ ...cardResumo, borderLeft: '5px solid #28a745' }}>
          <span style={{ color: '#28a745', display: 'flex', alignItems: 'center', gap: '5px' }}><ArrowUpCircle size={20}/> Entradas</span>
          <h2 style={{ margin: '10px 0' }}>{resumo.receitas.toLocaleString()} CFA</h2>
        </div>
        
        <div style={{ ...cardResumo, borderLeft: '5px solid #dc3545' }}>
          <span style={{ color: '#dc3545', display: 'flex', alignItems: 'center', gap: '5px' }}><ArrowDownCircle size={20}/> Saídas</span>
          <h2 style={{ margin: '10px 0' }}>{resumo.despesas.toLocaleString()} CFA</h2>
        </div>

        <div style={{ ...cardResumo, borderLeft: `5px solid ${resumo.saldo >= 0 ? '#007bff' : '#ffc107'}` }}>
          <span style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}><DollarSign size={20}/> Saldo Atual</span>
          <h2 style={{ margin: '10px 0', color: resumo.saldo >= 0 ? '#007bff' : '#d68a00' }}>{resumo.saldo.toLocaleString()} CFA</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', md: 'row', gap: '20px' }}>
        
        {/* GRÁFICO VISUAL */}
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '20px', color: '#555' }}>Balanço Visual</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" radius={[5, 5, 0, 0]} barSize={50}>
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LISTA DE ÚLTIMOS LANÇAMENTOS */}
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', color: '#555' }}>Extrato Recente</h3>
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: '250px', overflowY: 'auto' }}>
            {lancamentos.length === 0 ? <p style={{color:'#999'}}>Nenhuma movimentação.</p> : lancamentos.map(l => (
              <li key={l._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                <div>
                  <strong style={{ display: 'block' }}>{l.descricao}</strong>
                  <small style={{ color: '#888' }}>{new Date(l.data).toLocaleDateString()}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 'bold', color: l.tipo === 'receita' ? '#28a745' : '#dc3545', display: 'block' }}>
                    {l.tipo === 'receita' ? '+' : '-'} {l.valor}
                  </span>
                  <button onClick={() => deletarLancamento(l._id)} style={{ border: 'none', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '12px' }}><Trash2 size={14}/></button>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

// Estilo dos Cards
const cardResumo = {
  flex: '1 1 200px',
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

export default RelatorioFinanceiro;