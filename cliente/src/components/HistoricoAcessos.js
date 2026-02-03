import React, { useState, useEffect } from 'react';
import api from '../api';
import { Clock, User, Calendar, Monitor, Smartphone } from 'lucide-react';

const HistoricoAcessos = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarLogs();
  }, []);

  const carregarLogs = async () => {
    try {
      // Ajuste a rota conforme seu backend
      const res = await api.get('/admin/logs');
      setLogs(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar histórico", err);
      setLoading(false);
    }
  };

  // Função para formatar data bonita (Ex: 03/02/2026)
  const formatarData = (dataIso) => {
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para formatar hora (Ex: 14:30)
  const formatarHora = (dataIso) => {
    const data = new Date(dataIso);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginTop: '20px' }}>
      <h3 style={{ borderBottom: '2px solid #009E49', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock size={24} color="#009E49" />
        Histórico de Acessos Recentes
      </h3>

      {loading ? (
        <p>Carregando registros...</p>
      ) : logs.length === 0 ? (
        <p>Nenhum acesso registrado ainda.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', color: '#333', textAlign: 'left' }}>
                <th style={thStyle}><User size={16}/> Usuário</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}><Monitor size={16}/> Dispositivo</th>
                <th style={thStyle}><Calendar size={16}/> Data</th>
                <th style={thStyle}><Clock size={16}/> Hora</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee', transition: '0.2s' }} className="linha-tabela">
                  <td style={tdStyle}><strong>{log.nome}</strong></td>
                  <td style={tdStyle}>{log.email}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      display: 'flex', alignItems: 'center', gap: '5px',
                      color: log.dispositivo === 'Computador' ? '#0078D4' : '#CE1126' 
                    }}>
                      {log.dispositivo === 'Computador' ? <Monitor size={14}/> : <Smartphone size={14}/>}
                      {log.dispositivo || 'Desconhecido'}
                    </span>
                  </td>
                  <td style={tdStyle}>{formatarData(log.data)}</td>
                  <td style={tdStyle} style={{color: '#666'}}>{formatarHora(log.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Estilos CSS Inline para Tabela
const thStyle = { padding: '12px', fontSize: '14px', fontWeight: 'bold', color: '#555' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#333' };

export default HistoricoAcessos;