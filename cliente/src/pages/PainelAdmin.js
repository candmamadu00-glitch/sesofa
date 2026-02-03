import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
// Adicionei 'Activity' e 'Clock' na importação de ícones
import { Users, FileText, LogOut, CheckCircle, PlusCircle, Bell, Download, XCircle, Briefcase, Search, Trash2, Calendar, DollarSign, User, Lock, Clock, Activity } from 'lucide-react';
import RelatorioFinanceiro from '../components/RelatorioFinanceiro';
import HistoricoAcessos from '../components/HistoricoAcessos'; // Importação do componente

const PainelAdmin = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [clientes, setClientes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [historicoServicos, setHistoricoServicos] = useState([]);
  const [historicoConsultorias, setHistoricoConsultorias] = useState([]);

  const [aba, setAba] = useState('clientes');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  const [consultoriaForm, setConsultoriaForm] = useState({ clienteId: '', titulo: '', mensagem: '' });
  const [servicoForm, setServicoForm] = useState({ clienteId: '', titulo: '', descricao: '', custo: '' });
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [baixandoId, setBaixandoId] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      const resClientes = await api.get('/clientes');
      setClientes(resClientes.data);
      const resDocs = await api.get('/documentos-geral');
      setDocumentos(resDocs.data);
      const resSoli = await api.get('/solicitacoes-geral');
      setSolicitacoes(resSoli.data);
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

  // --- DOWNLOAD SEGURO ---
  const baixarArquivo = async (url, nomeArquivo, docId) => {
    if (!url) return alert("Erro: Link não encontrado.");
    const secureUrl = url.replace('http://', 'https://');
    setBaixandoId(docId);

    try {
      const response = await fetch(secureUrl);
      if (!response.ok) throw new Error("Erro ao acessar o arquivo");
      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      let nomeFinal = nomeArquivo || 'documento.pdf';
      if (!nomeFinal.toLowerCase().endsWith('.pdf')) {
          nomeFinal += '.pdf';
      }

      link.download = nomeFinal; 
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Erro no download:", error);
      alert("Erro ao baixar. Tentando abrir em nova aba...");
      window.open(secureUrl, '_blank');
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

  const resetarSenha = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja resetar a senha de ${nome} para "123456"?`)) {
      try {
        const token = localStorage.getItem('token');
        await api.put(`/auth/admin/reset-senha/${id}`, {}, {
          headers: { 'x-auth-token': token }
        });
        alert(`✅ Sucesso! A senha de ${nome} agora é: 123456`);
      } catch (err) { alert("Erro ao resetar senha."); }
    }
  };

  const deletarItem = async (id, tipo) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR este item?`)) return;
    try {
      if (tipo === 'documento') await api.delete(`/documentos/${id}`);
      else if (tipo === 'cliente') await api.delete(`/clientes/${id}`);
      else if (tipo === 'servico') await api.delete(`/servicos/${id}`);
      else if (tipo === 'consultoria') await api.delete(`/consultorias/${id}`);
      alert(`✅ Item removido!`);
      carregarDados();
    } catch (err) { alert("❌ Erro ao deletar."); }
  };

  const enviarDica = async (e) => {
    e.preventDefault();
    try {
      await api.post('/enviar-consultoria', consultoriaForm);
      alert("✅ Consultoria enviada!");
      setConsultoriaForm({ clienteId: '', titulo: '', mensagem: '' });
      carregarDados();
    } catch (err) { alert("Erro ao enviar."); }
  };

  const salvarServico = async (e) => {
    e.preventDefault();
    try {
      await api.post('/registrar-servico', { ...servicoForm, custo: Number(servicoForm.custo) });
      alert("✅ Serviço registrado!");
      setServicoForm({ clienteId: '', titulo: '', descricao: '', custo: '' });
      carregarDados();
    } catch (err) { alert("Erro ao salvar."); }
  };

  const mudarAba = (novaAba) => {
    setAba(novaAba); setBusca(''); setFiltroStatus('Todos');
  };

  // --- COMPONENTES AUXILIARES PARA MOBILE ---
  const MobileCard = ({ children, titulo, subtitulo, status, actions }) => (
    <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '15px', borderLeft: '5px solid var(--gb-green)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <h4 style={{ margin: 0, color: '#333' }}>{titulo}</h4>
          {subtitulo && <small style={{ color: '#666' }}>{subtitulo}</small>}
        </div>
        {status && <span style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#eee', color: '#333' }}>{status}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: '#555', fontSize: '14px' }}>
        {children}
      </div>
      {actions && <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );

  const MobileLabel = ({ icon: Icon, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {Icon && <Icon size={14} color="#888" />}
        <span style={{ color: color || '#555' }}>{value}</span>
    </div>
  );

  // --- ESTILOS ---
  const containerPrincipal = { display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', backgroundColor: '#f0f2f5' };
  const sidebarContainer = { width: isMobile ? '100%' : '260px', backgroundColor: '#111', color: 'white', padding: isMobile ? '15px 10px' : '25px 15px', position: isMobile ? 'sticky' : 'relative', top: 0, zIndex: 100 };
  const navScrollStyle = { marginTop: isMobile ? '10px' : '30px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', overflowX: isMobile ? 'auto' : 'visible', whiteSpace: 'nowrap', gap: isMobile ? '10px' : '0' };
  const getItemStyle = (ativo) => ({ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '5px', backgroundColor: ativo ? 'var(--gb-green)' : isMobile ? '#222' : 'transparent', marginBottom: isMobile ? '0' : '5px', minWidth: isMobile ? 'auto' : '100%', border: isMobile && !ativo ? '1px solid #333' : 'none' });

  return (
    <div style={containerPrincipal}>
      <div style={sidebarContainer}>
        <h2 style={{ color: 'var(--gb-yellow)', borderBottom: '2px solid var(--gb-red)', textAlign: 'center', paddingBottom: '15px', fontSize: isMobile ? '18px' : '24px', margin: 0 }}>SESOFA ADMIN</h2>
        <nav style={navScrollStyle} className="hide-scrollbar">
          <div onClick={() => mudarAba('clientes')} style={getItemStyle(aba === 'clientes')}><Users size={18} /> {isMobile ? "Clientes" : "Gerir Clientes"}</div>
          <div onClick={() => mudarAba('solicitacoes')} style={getItemStyle(aba === 'solicitacoes')}><Bell size={18} /> Solicitações</div>
          <div onClick={() => mudarAba('registrar_os')} style={getItemStyle(aba === 'registrar_os')}><PlusCircle size={18} /> Novo Serviço</div>
          <div onClick={() => mudarAba('consultoria')} style={getItemStyle(aba === 'consultoria')}><Briefcase size={18} /> Consultoria</div>
          <div onClick={() => mudarAba('documentos')} style={getItemStyle(aba === 'documentos')}><FileText size={18} /> Analisar Docs</div>
          {/* NOVA ABA DE HISTÓRICO NO MENU */}
          <div onClick={() => mudarAba('logs')} style={getItemStyle(aba === 'logs')}><Activity size={18} /> Histórico Acessos</div>
          
          <div onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{ ...getItemStyle(false), color: '#ff4d4d', marginTop: isMobile ? '0' : '30px', borderTop: '1px solid #333' }}><LogOut size={18} /> Sair</div>
        </nav>
      </div>

      <div style={{ flex: 1, padding: isMobile ? '20px 15px' : '40px', overflowY: isMobile ? 'auto' : 'visible' }}>
        
        {aba === 'clientes' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
              <h3>Empresas Atendidas ({clientesFiltrados.length})</h3>
              <div style={searchBoxStyle}>
                <Search size={18} color="#666" />
                <input type="text" placeholder="Buscar empresa..." style={{ border: 'none', outline: 'none', width: '100%' }} value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </div>

            {isMobile ? (
               <div>
                  {clientesFiltrados.map(c => (
                      <MobileCard key={c._id} titulo={c.nome} actions={
                          <>
                             <button onClick={() => { setClienteSelecionado(c._id); setAba('financeiro'); }} className="btn-action" style={{backgroundColor: '#007bff'}}>Dashboard</button>
                             <button onClick={() => resetarSenha(c._id, c.nome)} className="btn-action" style={{backgroundColor: '#FF9800'}}>Resetar Senha</button>
                             <button onClick={() => deletarItem(c._id, 'cliente')} className="btn-action" style={{backgroundColor: '#dc3545'}}>Excluir</button>
                          </>
                      }>
                         <MobileLabel icon={FileText} value={c.email} />
                      </MobileCard>
                  ))}
               </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                <table style={{ ...tableStyle, minWidth: '600px' }}>
                    <thead><tr><th style={tableHeader}>Nome</th><th style={tableHeader}>Email</th><th style={tableHeader}>Ação</th></tr></thead>
                    <tbody>{clientesFiltrados.map(c => (
                    <tr key={c._id}>
                        <td style={tableCell}>{c.nome}</td><td style={tableCell}>{c.email}</td>
                        <td style={tableCell}>
                        <button onClick={() => { setClienteSelecionado(c._id); setAba('financeiro'); }} style={{ cursor: 'pointer', color: 'blue', border: 'none', background: 'none', fontWeight: 'bold', marginRight: '10px' }}>Dashboard</button>
                        <button onClick={() => deletarItem(c._id, 'cliente')} style={{ cursor: 'pointer', color: 'red', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                        <button onClick={() => resetarSenha(c._id, c.nome)} title="Resetar Senha" style={{ border: 'none', background: '#FF9800', color: 'white', borderRadius: '5px', padding: '5px', cursor: 'pointer', marginLeft: '5px' }}><Lock size={14}/></button>
                        </td>
                    </tr>
                    ))}</tbody>
                </table>
                </div>
            )}
          </div>
        )}

        {aba === 'solicitacoes' && (
          <div style={cardStyle}>
             <h3>Solicitações</h3>
             {isMobile ? (
                 <div>
                    {solicitacoes.map(s => (
                        <MobileCard key={s._id} titulo={s.clienteId?.nome} subtitulo={new Date(s.dataSolicitacao).toLocaleDateString()}>
                            <MobileLabel icon={Briefcase} value={s.servicoDesejado} color="var(--gb-green)" />
                            <p style={{margin: '5px 0', fontStyle: 'italic'}}>"{s.detalhes}"</p>
                        </MobileCard>
                    ))}
                 </div>
             ) : (
                 <div style={{ overflowX: 'auto' }}><table style={{ ...tableStyle, minWidth: '600px' }}><thead><tr><th style={tableHeader}>Cliente</th><th style={tableHeader}>Serviço</th><th style={tableHeader}>Detalhes</th><th style={tableHeader}>Data</th></tr></thead><tbody>{solicitacoes.map(s => (<tr key={s._id}><td style={tableCell}>{s.clienteId?.nome}</td><td style={tableCell}>{s.servicoDesejado}</td><td style={tableCell}>{s.detalhes}</td><td style={tableCell}>{new Date(s.dataSolicitacao || Date.now()).toLocaleDateString()}</td></tr>))}</tbody></table></div>
             )}
          </div>
        )}

        {aba === 'registrar_os' && (
          <div style={cardStyle}>
            <h3>Registrar Novo Serviço</h3>
            <form onSubmit={salvarServico} style={{ marginBottom: '30px' }}><select style={inputStyle} value={servicoForm.clienteId} onChange={e => setServicoForm({ ...servicoForm, clienteId: e.target.value })} required><option value="">Selecione o Cliente</option>{clientes.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}</select><input type="text" placeholder="Serviço" style={inputStyle} value={servicoForm.titulo} onChange={e => setServicoForm({ ...servicoForm, titulo: e.target.value })} required /><input type="text" placeholder="Descrição" style={inputStyle} value={servicoForm.descricao} onChange={e => setServicoForm({ ...servicoForm, descricao: e.target.value })} required /><input type="number" placeholder="Valor" style={inputStyle} value={servicoForm.custo} onChange={e => setServicoForm({ ...servicoForm, custo: e.target.value })} required /><button className="btn-gb" style={{ width: '100%' }}>Salvar</button></form>
            <hr /><h4 style={{ color: '#555' }}>Histórico</h4>
            {isMobile ? (
                <div>
                   {historicoServicos.map(serv => (
                       <MobileCard key={serv._id} titulo={serv.titulo} actions={<button onClick={() => deletarItem(serv._id, 'servico')} className="btn-action" style={{backgroundColor: '#dc3545'}}>Excluir</button>}>
                           <MobileLabel icon={User} value={serv.clienteId?.nome} />
                           <MobileLabel icon={DollarSign} value={serv.custo + ' CFA'} color="#dc3545" />
                           <MobileLabel icon={Calendar} value={new Date(serv.data).toLocaleDateString()} />
                       </MobileCard>
                   ))}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}><table style={{ ...tableStyle, minWidth: '600px' }}><thead><tr style={{ background: '#f4f4f4' }}><th style={tableHeader}>Data</th><th style={tableHeader}>Cliente</th><th style={tableHeader}>Serviço</th><th style={tableHeader}>Valor</th><th style={tableHeader}>Ação</th></tr></thead><tbody>{historicoServicos.map(serv => (<tr key={serv._id}><td style={tableCell}>{new Date(serv.data).toLocaleDateString()}</td><td style={tableCell}>{serv.clienteId?.nome}</td><td style={tableCell}>{serv.titulo}</td><td style={tableCell}>{serv.custo}</td><td style={tableCell}><button onClick={() => deletarItem(serv._id, 'servico')} style={{ border: 'none', background: 'transparent', color: 'red' }}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
            )}
          </div>
        )}

        {aba === 'consultoria' && (
          <div style={cardStyle}>
            <h3>Enviar Orientação</h3>
            <form onSubmit={enviarDica} style={{ marginBottom: '30px' }}><select style={inputStyle} value={consultoriaForm.clienteId} onChange={e => setConsultoriaForm({ ...consultoriaForm, clienteId: e.target.value })} required><option value="">Selecione o Cliente</option>{clientes.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}</select><input type="text" placeholder="Título" style={inputStyle} value={consultoriaForm.titulo} onChange={e => setConsultoriaForm({ ...consultoriaForm, titulo: e.target.value })} required /><textarea placeholder="Mensagem..." style={{ ...inputStyle, height: '100px' }} value={consultoriaForm.mensagem} onChange={e => setConsultoriaForm({ ...consultoriaForm, mensagem: e.target.value })} required /><button className="btn-gb" style={{ width: '100%' }}>Enviar</button></form>
            <hr /><h4 style={{ color: '#555' }}>Histórico</h4>
            {isMobile ? (
                 <div>
                    {historicoConsultorias.map(dica => (
                        <MobileCard key={dica._id} titulo={dica.titulo} actions={<button onClick={() => deletarItem(dica._id, 'consultoria')} className="btn-action" style={{backgroundColor: '#dc3545'}}>Excluir</button>}>
                            <MobileLabel icon={User} value={dica.clienteId?.nome} />
                            <MobileLabel icon={Calendar} value={new Date(dica.data).toLocaleDateString()} />
                        </MobileCard>
                    ))}
                 </div>
            ) : (
                <div style={{ overflowX: 'auto' }}><table style={{ ...tableStyle, minWidth: '600px' }}><thead><tr style={{ background: '#f4f4f4' }}><th style={tableHeader}>Data</th><th style={tableHeader}>Cliente</th><th style={tableHeader}>Título</th><th style={tableHeader}>Ação</th></tr></thead><tbody>{historicoConsultorias.map(dica => (<tr key={dica._id}><td style={tableCell}>{new Date(dica.data).toLocaleDateString()}</td><td style={tableCell}>{dica.clienteId?.nome}</td><td style={tableCell}>{dica.titulo}</td><td style={tableCell}><button onClick={() => deletarItem(dica._id, 'consultoria')} style={{ border: 'none', background: 'transparent', color: 'red' }}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
            )}
          </div>
        )}

        {aba === 'financeiro' && clienteSelecionado && (<div><button onClick={() => setAba('clientes')} style={{ padding: '10px', marginBottom: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '5px' }}>Voltar</button><RelatorioFinanceiro clienteId={clienteSelecionado} /></div>)}

        {aba === 'documentos' && (
          <div style={cardStyle}>
            <h3>Documentos Recebidos</h3>
            
            {isMobile ? (
                <div>
                   {documentosFiltrados.map(doc => (
                       <MobileCard key={doc._id} titulo={doc.nomeArquivo} status={doc.status} 
                         actions={
                             <>
                                <button onClick={() => baixarArquivo(doc.caminho, doc.nomeArquivo, doc._id)} className="btn-action" style={{backgroundColor: '#007bff'}} disabled={baixandoId === doc._id}>
                                    {baixandoId === doc._id ? "..." : <Download size={16}/>}
                                </button>
                                <button onClick={() => mudarStatusDoc(doc._id, 'Aprovado')} className="btn-action" style={{backgroundColor: '#28a745'}}><CheckCircle size={16}/></button>
                                <button onClick={() => mudarStatusDoc(doc._id, 'Recusado')} className="btn-action" style={{backgroundColor: '#dc3545'}}><XCircle size={16}/></button>
                                <button onClick={() => deletarItem(doc._id, 'documento')} className="btn-action" style={{backgroundColor: '#333'}}><Trash2 size={16}/></button>
                             </>
                         }
                       >
                           <MobileLabel icon={User} value={doc.clienteId?.nome} />
                           <MobileLabel icon={Calendar} value={new Date(doc.dataEnvio).toLocaleDateString()} />
                       </MobileCard>
                   ))}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                <table style={{ ...tableStyle, minWidth: '800px' }}>
                    <thead><tr style={{ background: '#333', color: 'white' }}><th style={tableHeader}>Data</th><th style={tableHeader}>Cliente</th><th style={tableHeader}>Arquivo</th><th style={tableHeader}>Status</th><th style={tableHeader}>Ações</th></tr></thead>
                    <tbody>{documentosFiltrados.map(doc => (
                    <tr key={doc._id}>
                        <td style={tableCell}>{new Date(doc.dataEnvio || Date.now()).toLocaleDateString()}</td>
                        <td style={tableCell}>{doc.clienteId?.nome}</td>
                        <td style={tableCell}>
                        <button 
                            onClick={() => baixarArquivo(doc.caminho, doc.nomeArquivo, doc._id)} 
                            disabled={baixandoId === doc._id}
                            style={{ background: 'none', border: 'none', cursor: baixandoId === doc._id ? 'wait' : 'pointer', color: baixandoId === doc._id ? '#999' : '#007bff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            {baixandoId === doc._id ? <>⏳ Baixando...</> : <><Download size={16} /> Baixar</>}
                        </button>
                        </td>
                        <td style={tableCell}>{doc.status || 'Pendente'}</td>
                        <td style={{ ...tableCell, display: 'flex', gap: '10px' }}>
                            <button onClick={() => mudarStatusDoc(doc._id, 'Aprovado')} style={{ border: 'none', background: '#28a745', color: 'white', borderRadius: '5px', padding: '5px', cursor: 'pointer' }}><CheckCircle size={18} /></button>
                            <button onClick={() => mudarStatusDoc(doc._id, 'Recusado')} style={{ border: 'none', background: '#dc3545', color: 'white', borderRadius: '5px', padding: '5px', cursor: 'pointer' }}><XCircle size={18} /></button>
                            <button onClick={() => deletarItem(doc._id, 'documento')} style={{ border: 'none', background: '#111', color: 'white', borderRadius: '5px', padding: '5px', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </td>
                    </tr>
                    ))}</tbody>
                </table>
                </div>
            )}
          </div>
        )}

        {/* --- NOVA ABA DE LOGS --- */}
        {aba === 'logs' && (
             <div style={cardStyle}>
                 <HistoricoAcessos />
             </div>
        )}
      </div>
      
      {/* STYLE TAG PARA BOTÕES MOBILE */}
      <style>{`
         .btn-action {
             border: none; color: white; border-radius: 5px; padding: 8px 12px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
         }
      `}</style>
    </div>
  );
};

const cardStyle = { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px' };
const tableHeader = { padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' };
const tableCell = { padding: '10px', borderBottom: '1px solid #eee' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const searchBoxStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' };

export default PainelAdmin;