import React, { useEffect, useState, useCallback } from 'react';
import api from '../api'; 
import { Users, FileText, LogOut, CheckCircle, PlusCircle, Bell, Download, XCircle, Briefcase, Search, Filter, Trash2, History } from 'lucide-react';
import RelatorioFinanceiro from '../components/RelatorioFinanceiro';

const PainelAdmin = () => {
  // --- DETECTAR TAMANHO DA TELA (MOBILE) ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- ESTADOS DE DADOS ---
  const [clientes, setClientes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [historicoServicos, setHistoricoServicos] = useState([]); // NOVO
  const [historicoConsultorias, setHistoricoConsultorias] = useState([]); // NOVO
  
  // --- ESTADOS DE CONTROLE ---
  const [aba, setAba] = useState('clientes');
  const [baixandoId, setBaixandoId] = useState(null);
  
  // --- PESQUISA E FILTRO ---
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  // --- FORMULÁRIOS ---
  const [consultoriaForm, setConsultoriaForm] = useState({ clienteId: '', titulo: '', mensagem: '' });
  const [servicoForm, setServicoForm] = useState({ clienteId: '', titulo: '', descricao: '', custo: '' });
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      const resClientes = await api.get('/clientes');
      setClientes(resClientes.data);
      
      const resDocs = await api.get('/documentos-geral');
      setDocumentos(resDocs.data);
      
      const resSoli = await api.get('/solicitacoes-geral');
      setSolicitacoes(resSoli.data);

      // --- NOVAS CHAMADAS ---
      const resServicos = await api.get('/servicos-geral');
      setHistoricoServicos(resServicos.data);

      const resConsultorias = await api.get('/consultorias-geral');
      setHistoricoConsultorias(resConsultorias.data);

    } catch (err) {
      console.error("Erro ao carregar dados.", err);
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      window.location.href = '/';
    } else {
      carregarDados();
    }
  }, [carregarDados]);

  // --- FILTRAGEM ---
  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

  const documentosFiltrados = documentos.filter(doc => {
    const correspondeBusca = 
      doc.clienteId?.nome.toLowerCase().includes(busca.toLowerCase()) ||
      doc.nomeArquivo.toLowerCase().includes(busca.toLowerCase());
    const correspondeStatus = filtroStatus === 'Todos' ? true : doc.status === filtroStatus;
    return correspondeBusca && correspondeStatus;
  });

  // --- AÇÕES ---
  const baixarArquivo = async (url, nomeArquivo, idDoc) => {
    if (!url) return alert("Erro: Link não encontrado.");
    setBaixandoId(idDoc);
    try {
      const urlSegura = url.replace('http://', 'https://');
      const response = await fetch(urlSegura);
      if (!response.ok) throw new Error('Falha ao buscar arquivo');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = nomeArquivo || 'documento_sesofa.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Erro no download:", err);
      window.open(url.replace('http://', 'https://'), '_blank');
    } finally {
      setBaixandoId(null);
    }
  };

  const mudarStatusDoc = async (id, novoStatus) => {
    try {
      await api.put(`/documentos/${id}`, { status: novoStatus });
      carregarDados(); 
    } catch (err) { alert("Erro ao atualizar status."); }
  };
// Função para Resetar Senha do Cliente
  const resetarSenha = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja resetar a senha de ${nome} para "123456"?`)) {
      try {
        const token = localStorage.getItem('token');
        await api.put(`/auth/admin/reset-senha/${id}`, {}, {
          headers: { 'x-auth-token': token }
        });
        alert(`✅ Sucesso! A senha de ${nome} agora é: 123456`);
      } catch (err) {
        alert("Erro ao resetar senha.");
      }
    }
  };
  const deletarItem = async (id, tipo) => {
    const confirmacao = window.confirm(`Tem certeza que deseja EXCLUIR este item? Essa ação não pode ser desfeita.`);
    if (!confirmacao) return;
    
    try {
      if (tipo === 'documento') await api.delete(`/documentos/${id}`);
      else if (tipo === 'cliente') await api.delete(`/clientes/${id}`);
      else if (tipo === 'servico') await api.delete(`/servicos/${id}`); // NOVO
      else if (tipo === 'consultoria') await api.delete(`/consultorias/${id}`); // NOVO
      
      alert(`✅ Item removido com sucesso!`);
      carregarDados();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao deletar.");
    }
  };

  const enviarDica = async (e) => {
    e.preventDefault();
    try {
      await api.post('/enviar-consultoria', consultoriaForm);
      alert("✅ Consultoria enviada!");
      setConsultoriaForm({ clienteId: '', titulo: '', mensagem: '' });
      carregarDados(); // Atualiza a lista
    } catch (err) { alert("Erro ao enviar."); }
  };

  const salvarServico = async (e) => {
    e.preventDefault();
    try {
      await api.post('/registrar-servico', { ...servicoForm, custo: Number(servicoForm.custo) });
      alert("✅ Serviço registrado!");
      setServicoForm({ clienteId: '', titulo: '', descricao: '', custo: '' });
      carregarDados(); // Atualiza a lista
    } catch (err) { alert("Erro ao salvar."); }
  };

  const mudarAba = (novaAba) => {
    setAba(novaAba);
    setBusca('');
    setFiltroStatus('Todos');
  };

  // --- LAYOUT ---
  const containerPrincipal = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', backgroundColor: '#f0f2f5' };
  const sidebarContainer = { width: isMobile ? '100%' : '260px', backgroundColor: '#111', color: 'white', padding: isMobile ? '15px 10px' : '25px 15px', position: isMobile ? 'sticky' : 'relative', top: 0, zIndex: 100, boxShadow: isMobile ? '0 4px 6px rgba(0,0,0,0.2)' : 'none' };
  const navScrollStyle = { marginTop: isMobile ? '10px' : '30px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', overflowX: isMobile ? 'auto' : 'visible', whiteSpace: 'nowrap', gap: isMobile ? '10px' : '0', paddingBottom: isMobile ? '5px' : '0' };
  const getItemStyle = (ativo) => ({ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '5px', backgroundColor: ativo ? 'var(--gb-green)' : isMobile ? '#222' : 'transparent', marginBottom: isMobile ? '0' : '5px', minWidth: isMobile ? 'auto' : '100%', flex: isMobile ? '0 0 auto' : 'initial', border: isMobile && !ativo ? '1px solid #333' : 'none' });

  return (
    <div style={containerPrincipal}>
      {/* SIDEBAR */}
      <div style={sidebarContainer}>
        <h2 style={{ color: 'var(--gb-yellow)', borderBottom: '2px solid var(--gb-red)', textAlign: 'center', paddingBottom: '15px', fontSize: isMobile ? '18px' : '24px', margin: 0 }}>SESOFA ADMIN</h2>
        <nav style={navScrollStyle} className="hide-scrollbar">
          <div onClick={() => mudarAba('clientes')} style={getItemStyle(aba === 'clientes')}><Users size={18}/> {isMobile ? "Clientes" : "Gerir Clientes"}</div>
          <div onClick={() => mudarAba('solicitacoes')} style={getItemStyle(aba === 'solicitacoes')}><Bell size={18}/> Solicitações</div>
          <div onClick={() => mudarAba('registrar_os')} style={getItemStyle(aba === 'registrar_os')}><PlusCircle size={18}/> Novo Serviço</div>
          <div onClick={() => mudarAba('consultoria')} style={getItemStyle(aba === 'consultoria')}><Briefcase size={18}/> Consultoria</div>
          <div onClick={() => mudarAba('documentos')} style={getItemStyle(aba === 'documentos')}><FileText size={18}/> Analisar Docs</div>
          <div onClick={() => { localStorage.clear(); window.location.href='/'; }} style={{...getItemStyle(false), color: '#ff4d4d', border: isMobile ? '1px solid #ff4d4d' : 'none', marginTop: isMobile ? '0' : '30px', borderTop: isMobile ? '1px solid #ff4d4d' : '1px solid #333' }}><LogOut size={18}/> Sair</div>
        </nav>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: isMobile ? '20px 15px' : '40px' }}>
        
        {aba === 'clientes' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', marginBottom: '20px', gap: '10px' }}>
              <h3>Empresas Atendidas ({clientesFiltrados.length})</h3>
              <div style={{...searchBoxStyle, width: isMobile ? '100%' : 'auto'}}>
                <Search size={18} color="#666" />
                <input type="text" placeholder="Buscar cliente..." style={{ border: 'none', outline: 'none', width: '100%' }} value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{...tableStyle, minWidth: '600px'}}>
                <thead><tr><th style={tableHeader}>Nome</th><th style={tableHeader}>Email</th><th style={tableHeader}>Ação</th></tr></thead>
                <tbody>
                  {clientesFiltrados.map(c => (
                    <tr key={c._id}>
                      <td style={tableCell}>{c.nome}</td><td style={tableCell}>{c.email}</td>
                      <td style={tableCell}>
                        <button onClick={() => { setClienteSelecionado(c._id); setAba('financeiro'); }} style={{ cursor: 'pointer', color: 'blue', border:'none', background:'none', fontWeight:'bold', marginRight: '10px' }}>Ver Dashboard</button>
                        <button onClick={() => deletarItem(c._id, 'cliente')} style={{ cursor: 'pointer', color: 'red', border:'none', background:'none' }}><Trash2 size={16}/></button>
                        {/* --- BOTÃO DE RESETAR SENHA --- */}
<button 
  onClick={() => resetarSenha(cliente._id, cliente.nome)} 
  title="Resetar Senha para '123456'"
  style={{border:'none', background:'#FF9800', color:'white', borderRadius:'5px', padding:'5px', cursor:'pointer', marginRight:'5px'}}
>
  🔑
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aba === 'solicitacoes' && (
          <div style={cardStyle}>
            <h3>Solicitações Recebidas</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{...tableStyle, minWidth: '600px'}}>
                <thead><tr><th style={tableHeader}>Cliente</th><th style={tableHeader}>Serviço</th><th style={tableHeader}>Detalhes</th><th style={tableHeader}>Data</th></tr></thead>
                <tbody>{solicitacoes.map(s => (
                  <tr key={s._id}>
                    <td style={tableCell}>{s.clienteId?.nome}</td>
                    <td style={tableCell}>{s.servicoDesejado}</td>
                    <td style={tableCell}>{s.detalhes}</td>
                    <td style={tableCell}>{new Date(s.dataSolicitacao || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {aba === 'registrar_os' && (
          <div style={cardStyle}>
            <h3>Registrar Novo Serviço</h3>
            <form onSubmit={salvarServico} style={{ marginBottom: '30px' }}>
              <select style={inputStyle} value={servicoForm.clienteId} onChange={e => setServicoForm({...servicoForm, clienteId: e.target.value})} required>
                <option value="">Selecione o Cliente</option>
                {clientes.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
              </select>
              <input type="text" placeholder="Serviço (Título)" style={inputStyle} value={servicoForm.titulo} onChange={e => setServicoForm({...servicoForm, titulo: e.target.value})} required />
              <input type="text" placeholder="Descrição Detalhada" style={inputStyle} value={servicoForm.descricao} onChange={e => setServicoForm({...servicoForm, descricao: e.target.value})} required />
              <input type="number" placeholder="Valor (CFA)" style={inputStyle} value={servicoForm.custo} onChange={e => setServicoForm({...servicoForm, custo: e.target.value})} required />
              <button className="btn-gb" style={{width:'100%'}}>Salvar Serviço</button>
            </form>

            {/* TABELA DE HISTÓRICO DE SERVIÇOS ADICIONADA AQUI */}
            <hr style={{margin: '20px 0'}}/>
            <h4 style={{color: '#555'}}><History size={16} style={{display:'inline', marginRight:'5px'}}/> Histórico de Serviços Realizados</h4>
            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{...tableStyle, minWidth: '600px'}}>
                <thead>
                  <tr style={{background: '#f4f4f4'}}>
                    <th style={tableHeader}>Data</th>
                    <th style={tableHeader}>Cliente</th>
                    <th style={tableHeader}>Serviço</th>
                    <th style={tableHeader}>Valor</th>
                    <th style={tableHeader}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoServicos.map(serv => (
                    <tr key={serv._id}>
                      <td style={tableCell}>{new Date(serv.data).toLocaleDateString()}</td>
                      <td style={tableCell}>{serv.clienteId?.nome || 'Cliente Removido'}</td>
                      <td style={tableCell}>{serv.titulo}</td>
                      <td style={tableCell}>{serv.custo} CFA</td>
                      <td style={tableCell}>
                        <button onClick={() => deletarItem(serv._id, 'servico')} title="Excluir (Em caso de erro)" style={{border:'none', background:'transparent', color:'red', cursor:'pointer'}}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aba === 'consultoria' && (
          <div style={cardStyle}>
            <h3>Enviar Orientação / Aviso</h3>
            <form onSubmit={enviarDica} style={{ marginBottom: '30px' }}>
              <select style={inputStyle} value={consultoriaForm.clienteId} onChange={e => setConsultoriaForm({...consultoriaForm, clienteId: e.target.value})} required>
                <option value="">Selecione o Cliente</option>
                {clientes.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
              </select>
              <input type="text" placeholder="Título (Ex: Lembrete de Pagamento)" style={inputStyle} value={consultoriaForm.titulo} onChange={e => setConsultoriaForm({...consultoriaForm, titulo: e.target.value})} required />
              <textarea placeholder="Mensagem completa..." style={{...inputStyle, height:'100px'}} value={consultoriaForm.mensagem} onChange={e => setConsultoriaForm({...consultoriaForm, mensagem: e.target.value})} required />
              <button className="btn-gb" style={{width:'100%'}}>Enviar Mensagem</button>
            </form>

             {/* TABELA DE HISTÓRICO DE CONSULTORIAS ADICIONADA AQUI */}
             <hr style={{margin: '20px 0'}}/>
            <h4 style={{color: '#555'}}><History size={16} style={{display:'inline', marginRight:'5px'}}/> Histórico de Mensagens Enviadas</h4>
            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{...tableStyle, minWidth: '600px'}}>
                <thead>
                  <tr style={{background: '#f4f4f4'}}>
                    <th style={tableHeader}>Data</th>
                    <th style={tableHeader}>Cliente</th>
                    <th style={tableHeader}>Título</th>
                    <th style={tableHeader}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoConsultorias.map(dica => (
                    <tr key={dica._id}>
                      <td style={tableCell}>{new Date(dica.data).toLocaleDateString()}</td>
                      <td style={tableCell}>{dica.clienteId?.nome || 'Cliente Removido'}</td>
                      <td style={tableCell}>{dica.titulo}</td>
                      <td style={tableCell}>
                        <button onClick={() => deletarItem(dica._id, 'consultoria')} title="Excluir" style={{border:'none', background:'transparent', color:'red', cursor:'pointer'}}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aba === 'financeiro' && clienteSelecionado && (
          <div><button onClick={() => setAba('clientes')} style={{padding:'10px', marginBottom:'10px', background:'#333', color:'white', border:'none', borderRadius:'5px'}}>Voltar</button><RelatorioFinanceiro clienteId={clienteSelecionado} /></div>
        )}

        {aba === 'documentos' && (
          <div style={cardStyle}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--gb-red)', marginBottom: '15px' }}>📁 Documentos Recebidos ({documentosFiltrados.length})</h3>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px' }}>
                <div style={{ ...searchBoxStyle, flex: 1 }}>
                  <Search size={18} color="#666" />
                  <input type="text" placeholder="Buscar por cliente ou arquivo..." style={{ border: 'none', outline: 'none', width: '100%' }} value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
                <div style={{ ...searchBoxStyle, width: isMobile ? '100%' : '200px', padding: '0 10px' }}>
                  <Filter size={18} color="#666" />
                  <select style={{ border: 'none', outline: 'none', width: '100%', padding: '10px', background: 'transparent' }} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                    <option value="Todos">Todos os Status</option>
                    <option value="Pendente">🟡 Pendentes</option>
                    <option value="Aprovado">🟢 Aprovados</option>
                    <option value="Recusado">🔴 Recusados</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{...tableStyle, minWidth: '800px'}}>
                <thead>
                  <tr style={{ background: '#333', color: 'white' }}>
                    <th style={tableHeader}>Data</th><th style={tableHeader}>Cliente</th><th style={tableHeader}>Arquivo</th><th style={tableHeader}>Status</th><th style={tableHeader}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documentosFiltrados.map(doc => (
                    <tr key={doc._id}>
                      <td style={tableCell}>{new Date(doc.dataEnvio || Date.now()).toLocaleDateString()}</td>
                      <td style={tableCell}>{doc.clienteId?.nome}</td>
                      <td style={tableCell}>
                        <button onClick={() => baixarArquivo(doc.caminho, doc.nomeArquivo, doc._id)} disabled={baixandoId === doc._id} style={{ background: 'none', border: 'none', cursor: baixandoId === doc._id ? 'wait' : 'pointer', color: baixandoId === doc._id ? '#999' : '#007bff', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px' }}>
                          <Download size={16}/> {baixandoId === doc._id ? "A Baixar..." : "Baixar PDF"}
                        </button>
                      </td>
                      <td style={tableCell}>
                        <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', backgroundColor: doc.status === 'Aprovado' ? '#d4edda' : doc.status === 'Recusado' ? '#f8d7da' : '#fff3cd', color: doc.status === 'Aprovado' ? '#155724' : doc.status === 'Recusado' ? '#721c24' : '#856404' }}>{doc.status || 'Pendente'}</span>
                      </td>
                      <td style={{...tableCell, display:'flex', gap:'10px', alignItems: 'center'}}>
                        <button onClick={() => mudarStatusDoc(doc._id, 'Aprovado')} title="Aprovar" style={{border:'none', background:'#28a745', color:'white', borderRadius:'5px', padding:'5px', cursor:'pointer'}}><CheckCircle size={18}/></button>
                        <button onClick={() => mudarStatusDoc(doc._id, 'Recusado')} title="Recusar" style={{border:'none', background:'#dc3545', color:'white', borderRadius:'5px', padding:'5px', cursor:'pointer'}}><XCircle size={18}/></button>
                        <div style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 5px' }}></div>
                        <button onClick={() => deletarItem(doc._id, 'documento')} title="Excluir Permanentemente" style={{border:'none', background:'#111', color:'white', borderRadius:'5px', padding:'5px', cursor:'pointer'}}><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- ESTILOS GERAIS ---
const cardStyle = { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop:'15px' };
const tableHeader = { padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' };
const tableCell = { padding: '10px', borderBottom: '1px solid #eee' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const searchBoxStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' };

export default PainelAdmin;