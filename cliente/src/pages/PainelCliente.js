import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { MessageCircle, FileText, LayoutDashboard, LogOut, TrendingUp, History, Send, User, Lock, Save, Eye, EyeOff, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import RelatorioFinanceiro from '../components/RelatorioFinanceiro';

const PainelCliente = () => {
  // --- DETECTAR MOBILE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- ESTADOS ---
  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [arquivo, setArquivo] = useState(null);
  const [dicas, setDicas] = useState([]);
  const [financeiro, setFinanceiro] = useState({ tipo: 'receita', descricao: '', valor: '' });
  const [historico, setHistorico] = useState([]);
  const [meusDocumentos, setMeusDocumentos] = useState([]);
  const [solicitacao, setSolicitacao] = useState({ servicoDesejado: '', detalhes: '' });
  
  // Estado do Perfil
  const [perfil, setPerfil] = useState({ nome: '', email: '', telefone: '', novaSenha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false); // Novo estado para o olhinho

  const [loading, setLoading] = useState(false);
  
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');

  // --- BUSCAR DADOS GERAIS ---
  useEffect(() => {
    const carregarDadosCliente = async () => {
      if (!userId) return;
      try {
        const resDicas = await api.get(`/minha-consultoria/${userId}`);
        setDicas(resDicas.data);
        const resHistorico = await api.get('/meus-servicos/' + userId);
        setHistorico(resHistorico.data);
        const resDocs = await api.get('/meus-documentos/' + userId);
        setMeusDocumentos(resDocs.data);
      } catch (err) {
        console.error("Erro ao carregar dados do cliente", err);
      }
    };
    carregarDadosCliente();
  }, [userId]);

  // --- BUSCAR DADOS DE PERFIL ---
  useEffect(() => {
    if (abaAtiva === 'perfil') {
      api.get('/perfil')
        .then(res => setPerfil({ ...res.data, novaSenha: '' })) 
        .catch(err => console.error("Erro ao carregar perfil", err));
    }
  }, [abaAtiva]);

  // --- FUNÇÕES DE AÇÃO ---
  const handleLancamento = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lancamento', { clienteId: userId, ...financeiro, valor: Number(financeiro.valor) });
      alert("✅ Lançamento registrado com sucesso!");
      setFinanceiro({ tipo: 'receita', descricao: '', valor: '' });
      setAbaAtiva('resumo');
    } catch (err) { alert("❌ Erro ao salvar lançamento."); }
  };

  const enviarSolicitacao = async (e) => {
    e.preventDefault();
    try {
      await api.post('/solicitar-servico', { clienteId: userId, servicoDesejado: solicitacao.servicoDesejado, detalhes: solicitacao.detalhes });
      alert("✅ Solicitação enviada com sucesso!");
      setSolicitacao({ servicoDesejado: '', detalhes: '' });
      setAbaAtiva('resumo');
    } catch (err) { alert("❌ Falha ao enviar solicitação."); }
  };

  const atualizarPerfil = async (e) => {
    e.preventDefault();
    if (perfil.novaSenha && perfil.novaSenha.length < 6) {
      return alert("A nova senha deve ter pelo menos 6 dígitos.");
    }
    try {
      await api.put('/perfil', { telefone: perfil.telefone, novaSenha: perfil.novaSenha });
      alert("✅ Dados atualizados com sucesso!");
      setPerfil({ ...perfil, novaSenha: '' });
    } catch (err) {
      alert("Erro ao atualizar perfil.");
    }
  };

  const handleUpload = async () => {
    if (!arquivo) return alert("Selecione um arquivo primeiro!");
    setLoading(true);
    const formData = new FormData();
    formData.append('arquivo', arquivo); 
    formData.append('clienteId', userId);
    formData.append('tipoDoc', 'Recibo/Fatura');

    try {
      await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
      alert("✅ Documento enviado ao SESOFA com sucesso!");
      setArquivo(null);
      const resDocs = await api.get('/meus-documentos/' + userId);
      setMeusDocumentos(resDocs.data);
    } catch (err) {
      alert("❌ Erro no envio. Verifique se o arquivo não é muito pesado.");
    } finally {
      setLoading(false);
    }
  };

  // --- COMPONENTE CARD MOBILE ---
  const MobileCard = ({ children, titulo, subtitulo, status, statusColor }) => (
    <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '15px', borderLeft: '5px solid var(--gb-green)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <h4 style={{ margin: 0, color: '#333' }}>{titulo}</h4>
          {subtitulo && <small style={{ color: '#666' }}>{subtitulo}</small>}
        </div>
        {status && (
             <span style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', backgroundColor: statusColor + '20', color: statusColor }}>
                {status}
             </span>
        )}
      </div>
      <div style={{ fontSize: '14px', color: '#555', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {children}
      </div>
    </div>
  );

  const MobileLabel = ({ icon: Icon, label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
       {Icon && <Icon size={14} color="#888" />}
       <span style={{ color: color || '#555' }}>{value}</span>
    </div>
  );

  // --- ESTILOS RESPONSIVOS ---
  const containerPrincipal = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', backgroundColor: '#f4f7f6' };
  const sidebarContainer = { width: isMobile ? '100%' : '260px', backgroundColor: '#1a1a1a', color: 'white', padding: isMobile ? '15px 10px' : '20px', position: isMobile ? 'sticky' : 'relative', top: 0, zIndex: 100, boxShadow: isMobile ? '0 4px 6px rgba(0,0,0,0.2)' : 'none' };
  const navScrollStyle = { marginTop: isMobile ? '10px' : '30px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', overflowX: isMobile ? 'auto' : 'visible', whiteSpace: 'nowrap', gap: isMobile ? '10px' : '0', paddingBottom: isMobile ? '5px' : '0' };
  const itemMenuStyle = (ativo) => ({ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', cursor: 'pointer', borderRadius: '8px', marginBottom: isMobile ? '0' : '10px', backgroundColor: ativo ? 'var(--gb-green)' : isMobile ? '#333' : 'transparent', transition: '0.3s', fontWeight: ativo ? 'bold' : 'normal', minWidth: isMobile ? 'auto' : '100%', border: isMobile && !ativo ? '1px solid #444' : 'none' });

  return (
    <div style={containerPrincipal}>
      
      {/* SIDEBAR */}
      <div style={sidebarContainer}>
        <h2 style={{ color: 'var(--gb-yellow)', textAlign: 'center', borderBottom: '2px solid var(--gb-red)', paddingBottom: '10px', fontSize: isMobile ? '18px' : '24px', margin: 0 }}>SESOFA</h2>
        <nav style={navScrollStyle} className="hide-scrollbar">
          <div onClick={() => setAbaAtiva('resumo')} style={itemMenuStyle(abaAtiva === 'resumo')}><LayoutDashboard size={20} /> {isMobile ? "Início" : "Painel"}</div>
          <div onClick={() => setAbaAtiva('financeiro')} style={itemMenuStyle(abaAtiva === 'financeiro')}><TrendingUp size={20} /> {isMobile ? "Lançar" : "Lançar"}</div>
          <div onClick={() => setAbaAtiva('solicitar')} style={itemMenuStyle(abaAtiva === 'solicitar')}><Send size={20} /> {isMobile ? "Pedir" : "Solicitar"}</div>
          <div onClick={() => setAbaAtiva('servicos')} style={itemMenuStyle(abaAtiva === 'servicos')}><History size={20} /> {isMobile ? "Histórico" : "Serviços"}</div>
          <div onClick={() => setAbaAtiva('documentos')} style={itemMenuStyle(abaAtiva === 'documentos')}><FileText size={20} /> {isMobile ? "Docs" : "Documentos"}</div>
          <div onClick={() => setAbaAtiva('perfil')} style={itemMenuStyle(abaAtiva === 'perfil')}><User size={20} /> {isMobile ? "Perfil" : "Meu Perfil"}</div>
          <div onClick={() => setAbaAtiva('suporte')} style={itemMenuStyle(abaAtiva === 'suporte')}><MessageCircle size={20} /> {isMobile ? "Ajuda" : "Suporte"}</div>
          <div onClick={() => { localStorage.clear(); window.location.href='/'; }} style={{ ...itemMenuStyle(false), color: '#ff4d4d', marginTop: isMobile ? '0' : '30px', border: isMobile ? '1px solid #ff4d4d' : 'none' }}><LogOut size={20} /> Sair</div>
        </nav>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: isMobile ? '20px 15px' : '40px', overflowY: isMobile ? 'auto' : 'visible' }}>
        
        {abaAtiva === 'resumo' && (
          <>
            <div style={{ backgroundColor: 'var(--gb-green)', color: 'white', padding: '30px', borderRadius: '15px', marginBottom: '20px' }}>
              <h1 style={{fontSize: isMobile ? '22px' : '32px'}}>Olá, {userName}</h1>
              <p>Confira a saúde financeira do seu negócio em tempo real (Valores em CFA).</p>
            </div>
            <RelatorioFinanceiro clienteId={userId} />
            {dicas.length > 0 && (
                <div style={{marginTop: '20px'}}>
                    <h3 style={{color: '#555'}}>🔔 Avisos Recentes</h3>
                    {dicas.slice(0, 1).map(d => (
                          <div key={d._id} style={cardDicaStyle}>
                          <h4 style={{ color: 'var(--gb-green)', margin: 0 }}>{d.titulo}</h4>
                          <p style={{ marginTop: '5px', color: '#444' }}>{d.mensagem}</p>
                        </div>
                    ))}
                </div>
            )}
          </>
        )}

        {abaAtiva === 'perfil' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'var(--gb-green)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><User size={28}/> Meus Dados</h2>
            <form onSubmit={atualizarPerfil}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Nome da Empresa (Fixo)</label>
                <input type="text" value={perfil.nome} disabled style={{...inputStyle, background: '#e9ecef', color: '#666'}} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>E-mail (Login)</label>
                <input type="text" value={perfil.email} disabled style={{...inputStyle, background: '#e9ecef', color: '#666'}} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Telefone / WhatsApp</label>
                <input type="text" value={perfil.telefone} onChange={(e) => setPerfil({...perfil, telefone: e.target.value})} style={inputStyle} />
              </div>

              <hr style={{margin: '25px 0'}} />

              <div style={{ marginBottom: '20px' }}>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px', color: 'var(--gb-red)'}}>
                  <Lock size={16} style={{display:'inline', marginRight: '5px'}}/> Trocar Senha (Opcional)
                </label>
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <input 
                      type={mostrarSenha ? "text" : "password"} 
                      placeholder="Digite a nova senha aqui..." 
                      value={perfil.novaSenha} 
                      onChange={(e) => setPerfil({...perfil, novaSenha: e.target.value})} 
                      style={{...inputStyle, border: '1px solid var(--gb-red)', paddingRight: '40px'}} 
                    />
                    <div style={{position: 'absolute', right: '10px', cursor: 'pointer', color: '#666'}} onClick={() => setMostrarSenha(!mostrarSenha)}>
                        {mostrarSenha ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </div>
                </div>
                <small style={{color: '#777'}}>Deixe em branco se não quiser mudar a senha.</small>
              </div>
              <button type="submit" className="btn-gb" style={{ width: '100%', fontWeight: 'bold', display:'flex', justifyContent:'center', gap:'10px' }}><Save size={18}/> SALVAR ALTERAÇÕES</button>
            </form>
          </div>
        )}

        {abaAtiva === 'solicitar' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'var(--gb-green)', marginBottom: '20px' }}>📝 Solicitar Novo Serviço</h2>
            <form onSubmit={enviarSolicitacao}>
              <div style={{ marginBottom: '15px' }}><label>O que você precisa?</label><input type="text" placeholder="Ex: Abertura de Alvará..." style={inputStyle} value={solicitacao.servicoDesejado} onChange={(e) => setSolicitacao({...solicitacao, servicoDesejado: e.target.value})} required /></div>
              <div style={{ marginBottom: '20px' }}><label>Detalhes Adicionais:</label><textarea placeholder="Descreva aqui..." style={{ ...inputStyle, height: '120px' }} value={solicitacao.detalhes} onChange={(e) => setSolicitacao({...solicitacao, detalhes: e.target.value})} /></div>
              <button type="submit" className="btn-gb" style={{ width: '100%', fontWeight: 'bold' }}>ENVIAR SOLICITAÇÃO</button>
            </form>
          </div>
        )}

        {abaAtiva === 'servicos' && (
          <div style={{ background: 'white', padding: isMobile ? '15px' : '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'var(--gb-green)', marginBottom: '20px' }}>📜 Histórico de Serviços</h2>
            
            {/* VERSÃO MOBILE: CARDS */}
            {isMobile ? (
                <div>
                   {historico.length > 0 ? historico.map(s => (
                       <MobileCard key={s._id} titulo={s.titulo} subtitulo={s.descricao}>
                           <MobileLabel icon={Calendar} value={new Date(s.data).toLocaleDateString()} />
                           <MobileLabel icon={DollarSign} value={s.custo?.toLocaleString() + ' CFA'} color="#CE1126" />
                       </MobileCard>
                   )) : <p>Nenhum serviço registrado.</p>}
                </div>
            ) : (
                /* VERSÃO PC: TABELA */
                <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead><tr><th style={tableHeader}>Data</th><th style={tableHeader}>Serviço</th><th style={tableHeader}>Descrição</th><th style={tableHeader}>Valor</th></tr></thead>
                    <tbody>
                    {historico.length > 0 ? historico.map(s => (
                        <tr key={s._id}>
                        <td style={tableCell}>{new Date(s.data).toLocaleDateString()}</td><td style={{ ...tableCell, fontWeight: 'bold' }}>{s.titulo}</td><td style={{ ...tableCell, color: '#666' }}>{s.descricao}</td><td style={{ ...tableCell, color: 'var(--gb-red)', fontWeight: 'bold' }}>{s.custo?.toLocaleString()} CFA</td>
                        </tr>
                    )) : <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Nenhum serviço registrado ainda.</td></tr>}
                    </tbody>
                </table>
                </div>
            )}
          </div>
        )}

        {abaAtiva === 'financeiro' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'var(--gb-green)', marginBottom: '20px' }}>💰 Gestão de Fluxo de Caixa</h2>
            <form onSubmit={handleLancamento}>
              <div style={{ marginBottom: '15px' }}><label>Tipo de Movimentação:</label><select style={inputStyle} value={financeiro.tipo} onChange={(e) => setFinanceiro({...financeiro, tipo: e.target.value})}><option value="receita">🟢 Receita (Venda/Entrada)</option><option value="despesa">🔴 Despesa (Pagamento/Saída)</option></select></div>
              <div style={{ marginBottom: '15px' }}><label>Descrição:</label><input type="text" placeholder="Ex: Venda de mercadoria" style={inputStyle} value={financeiro.descricao} onChange={(e) => setFinanceiro({...financeiro, descricao: e.target.value})} required /></div>
              <div style={{ marginBottom: '20px' }}><label>Valor (CFA):</label><input type="number" style={inputStyle} value={financeiro.valor} onChange={(e) => setFinanceiro({...financeiro, valor: e.target.value})} required /></div>
              <button type="submit" className="btn-gb" style={{ width: '100%', fontWeight: 'bold' }}>CONFIRMAR LANÇAMENTO</button>
            </form>
          </div>
        )}

        {abaAtiva === 'documentos' && (
          <div style={{ background: 'white', padding: isMobile ? '15px' : '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'var(--gb-green)' }}>📤 Enviar Novo Documento</h2>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', alignItems: 'center', margin: '20px 0' }}>
              <input type="file" onChange={(e) => setArquivo(e.target.files[0])} style={{ flex: 1, width: isMobile ? '100%' : 'auto' }} />
              <button onClick={handleUpload} disabled={loading} className="btn-gb" style={{ width: isMobile ? '100%' : 'auto', padding: '10px 30px', opacity: loading ? 0.7 : 1 }}>{loading ? "A ENVIAR..." : "ENVIAR AGORA"}</button>
            </div>
            <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />
            <h3 style={{ color: '#555' }}>📂 Histórico de Envios</h3>
            
            {/* VERSÃO MOBILE: CARDS */}
            {isMobile ? (
                <div>
                  {meusDocumentos.length > 0 ? meusDocumentos.map(doc => {
                       const stColor = doc.status === 'Aprovado' ? '#28a745' : doc.status === 'Recusado' ? '#dc3545' : '#ffc107';
                       const StIcon = doc.status === 'Aprovado' ? CheckCircle : doc.status === 'Recusado' ? XCircle : Clock;
                       return (
                           <MobileCard key={doc._id} titulo={doc.nomeArquivo} status={doc.status || 'Pendente'} statusColor={stColor}>
                               <MobileLabel icon={Calendar} value={new Date(doc.dataEnvio || Date.now()).toLocaleDateString()} />
                           </MobileCard>
                       )
                  }) : <p style={{color:'#888'}}>Nenhum documento.</p>}
                </div>
            ) : (
                /* VERSÃO PC: TABELA */
                <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', minWidth: '500px' }}>
                    <thead><tr style={{ background: '#f8f9fa', textAlign: 'left' }}><th style={tableHeader}>Data</th><th style={tableHeader}>Arquivo</th><th style={tableHeader}>Status</th></tr></thead>
                    <tbody>
                    {meusDocumentos.length > 0 ? meusDocumentos.map(doc => (
                        <tr key={doc._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={tableCell}>{new Date(doc.dataEnvio || Date.now()).toLocaleDateString()}</td><td style={tableCell}>{doc.nomeArquivo}</td>
                        <td style={tableCell}>
                            <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', backgroundColor: doc.status === 'Aprovado' ? '#d4edda' : doc.status === 'Recusado' ? '#f8d7da' : '#fff3cd', color: doc.status === 'Aprovado' ? '#155724' : doc.status === 'Recusado' ? '#721c24' : '#856404' }}>{doc.status || 'Pendente'}</span>
                        </td>
                        </tr>
                    )) : <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Nenhum documento enviado ainda.</td></tr>}
                    </tbody>
                </table>
                </div>
            )}
          </div>
        )}

        {abaAtiva === 'suporte' && (
          <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '15px' }}>
            <h2 style={{ color: 'var(--gb-green)' }}>Canais Oficiais de Suporte</h2>
            <p>Fale diretamente com os fundadores do SESOFA:</p>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
              <div style={suporteBoxStyle}><h4>Demba Balde</h4><button onClick={() => window.open('https://wa.me/245966626730')} className="btn-gb" style={{width: '100%'}}>WhatsApp</button></div>
              <div style={suporteBoxStyle}><h4>Seco Soares</h4><button onClick={() => window.open('https://wa.me/245966793435')} className="btn-gb" style={{width: '100%'}}>WhatsApp</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- ESTILOS AUXILIARES ---
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' };
const cardDicaStyle = { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '15px', borderLeft: '8px solid var(--gb-yellow)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const suporteBoxStyle = { border: '1px solid #ddd', padding: '20px', borderRadius: '10px', minWidth: '200px' };
const tableHeader = { padding: '12px', color: '#666', fontSize: '14px', textAlign: 'left', borderBottom: '1px solid #ddd' };
const tableCell = { padding: '15px', fontSize: '14px', color: '#333', borderBottom: '1px solid #eee' };

export default PainelCliente;