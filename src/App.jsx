import { useState, useMemo } from 'react';

// Catálogo completo de produtos Higyés
const catalogoProdutos = [
  { id: 1, nome: 'Pasta Abrasiva Chauffeur 2kg', linha: 'Industrial' },
  { id: 2, nome: 'Pasta Abrasiva Chauffeur 500g', linha: 'Industrial' },
  { id: 3, nome: 'Sabão Abrasivo Chauffeur Suave', linha: 'Industrial' },
  { id: 4, nome: 'Sabão Abrasivo Chauffeur Tradicional', linha: 'Industrial' },
  { id: 5, nome: 'Sabão Abrasivo Higyés', linha: 'Industrial' },
  { id: 6, nome: 'Sabão de Coco 50x200g', linha: 'Doméstica' },
  { id: 7, nome: 'Sabão Glicerinado 50x200g', linha: 'Doméstica' },
  { id: 8, nome: 'Pasta para Limpeza 24x300g', linha: 'Doméstica' },
  { id: 9, nome: 'Saponáceo em Pó Limão 10x300g', linha: 'Doméstica' },
  { id: 10, nome: 'Saponáceo em Pó Natural 10x300g', linha: 'Doméstica' },
  { id: 11, nome: 'Saponáceo em Pó Pinho 10x300g', linha: 'Doméstica' },
  { id: 12, nome: 'Sabonete Glicerina Marbot Eucalipto', linha: 'Higiene Pessoal' },
  { id: 13, nome: 'Sabonete Glicerina Marbot Limão', linha: 'Higiene Pessoal' },
  { id: 14, nome: 'Sabonete Glicerina Marbot Natural', linha: 'Higiene Pessoal' },
  { id: 15, nome: 'Sabonete Glicerina Marbot Rosas', linha: 'Higiene Pessoal' }
];

function App() {
  // TEMA (Dark/Light) - carregado do localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Cores para os temas
  const themeStyles = {
    light: {
      background: '#f5f5f5',
      cardBackground: '#ffffff',
      textPrimary: '#1a237e',
      textSecondary: '#333333',
      textMuted: '#666666',
      borderColor: '#ddd',
      inputBg: '#ffffff',
      inputText: '#333333',
      tableHeader: '#e0e0e0',
      tableRowEven: '#f5f5f5',
      tableRowOdd: '#e8eaf6',
      shadow: '0 2px 8px rgba(0,0,0,0.1)',
      alertBg: '#e3f2fd',
    },
    dark: {
      background: '#121212',
      cardBackground: '#1e1e1e',
      textPrimary: '#90caf9',
      textSecondary: '#e0e0e0',
      textMuted: '#aaaaaa',
      borderColor: '#444',
      inputBg: '#2a2a2a',
      inputText: '#e0e0e0',
      tableHeader: '#333',
      tableRowEven: '#2a2a2a',
      tableRowOdd: '#1e1e1e',
      shadow: '0 2px 8px rgba(0,0,0,0.5)',
      alertBg: '#1a237e',
    }
  };

  const currentTheme = themeStyles[theme];

  // Estados do pedido atual
  const [clienteAtual, setClienteAtual] = useState('');
  const [dataUltimoPedido, setDataUltimoPedido] = useState('');
  const [consumoDiario, setConsumoDiario] = useState(5);
  const [itensPedido, setItensPedido] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(catalogoProdutos[0].id);
  const [quantidadeItem, setQuantidadeItem] = useState(1);
  const [precoItem, setPrecoItem] = useState(0);
  const [observacao, setObservacao] = useState('');

  // Histórico de pedidos
  const [historicoPedidos, setHistoricoPedidos] = useState(() => {
    const dados = localStorage.getItem('historicoPedidosHigyes');
    return dados ? JSON.parse(dados) : [];
  });

  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [previsao, setPrevisao] = useState(null);
  const [mostrarAviso, setMostrarAviso] = useState(false);

  // Calcular pedidos urgentes
  const pedidosUrgentes = useMemo(() => {
    const hoje = new Date();
    return historicoPedidos.filter(pedido => {
      const dataProxima = new Date(pedido.dataProximaCompra);
      const diff = (dataProxima - hoje) / (1000 * 60 * 60 * 24);
      return diff <= 15 && diff >= 0;
    });
  }, [historicoPedidos]);

  // Persistir histórico
  const atualizarHistorico = (novoHistorico) => {
    setHistoricoPedidos(novoHistorico);
    localStorage.setItem('historicoPedidosHigyes', JSON.stringify(novoHistorico));
  };

  // Adicionar item
  const adicionarItem = () => {
    if (quantidadeItem <= 0) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }
    const produto = catalogoProdutos.find(p => p.id === produtoSelecionado);
    if (!produto) return;
    const novoItem = {
      id: crypto.randomUUID(),
      produtoId: produto.id,
      nome: produto.nome,
      linha: produto.linha,
      quantidade: quantidadeItem,
      preco: precoItem,
      subtotal: quantidadeItem * precoItem
    };
    setItensPedido([...itensPedido, novoItem]);
    setQuantidadeItem(1);
    setPrecoItem(0);
  };

  // Remover item
  const removerItem = (id) => {
    setItensPedido(itensPedido.filter(item => item.id !== id));
  };

  // Totais
  const totalCaixas = itensPedido.reduce((acc, item) => acc + item.quantidade, 0);
  const totalValor = itensPedido.reduce((acc, item) => acc + item.subtotal, 0);

  // Calcular previsão
  const calcularPrevisao = () => {
    if (!clienteAtual.trim()) {
      alert('Digite o nome do cliente!');
      return;
    }
    if (!dataUltimoPedido) {
      alert('Selecione a data do último pedido!');
      return;
    }
    if (itensPedido.length === 0) {
      alert('Adicione pelo menos um item ao pedido!');
      return;
    }
    if (consumoDiario <= 0) {
      alert('Informe um consumo médio diário válido!');
      return;
    }

    const dataUltima = new Date(dataUltimoPedido);
    const diasEstoque = totalCaixas / consumoDiario;
    const diasParaProxima = Math.round(diasEstoque);
    const dataProxima = new Date(dataUltima);
    dataProxima.setDate(dataProxima.getDate() + diasParaProxima);

    let status, cor, statusDesc;
    if (diasParaProxima <= 15) {
      status = '🔴 URGENTE';
      cor = '#f44336';
      statusDesc = 'Cliente precisa de contato imediato! ⚠️';
    } else if (diasParaProxima <= 30) {
      status = '🟡 Em breve';
      cor = '#FF9800';
      statusDesc = 'Agendar contato em breve';
    } else if (diasParaProxima <= 60) {
      status = '🟢 Normal';
      cor = '#4CAF50';
      statusDesc = 'Acompanhar normalmente';
    } else {
      status = '🔵 Confortável';
      cor = '#2196F3';
      statusDesc = 'Monitorar periodicamente';
    }

    const novoPedido = {
      id: crypto.randomUUID(),
      cliente: clienteAtual,
      dataUltimoPedido: dataUltimoPedido,
      dataProximaCompra: dataProxima.toLocaleDateString('pt-BR'),
      diasParaProxima: diasParaProxima,
      itens: itensPedido,
      totalCaixas: totalCaixas,
      totalValor: totalValor,
      consumoDiario: consumoDiario,
      status,
      cor,
      statusDesc,
      observacao: observacao,
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    };

    setPrevisao(novoPedido);
    atualizarHistorico([novoPedido, ...historicoPedidos]);

    if (diasParaProxima <= 15) {
      setMostrarAviso(true);
    }
  };

  // Resetar formulário
  const resetarFormulario = () => {
    setClienteAtual('');
    setDataUltimoPedido('');
    setConsumoDiario(5);
    setItensPedido([]);
    setPrevisao(null);
    setObservacao('');
    setQuantidadeItem(1);
    setPrecoItem(0);
  };

  // Limpar histórico
  const limparHistorico = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
      atualizarHistorico([]);
    }
  };

  // Carregar pedido do histórico
  const carregarPedido = (pedido) => {
    setClienteAtual(pedido.cliente);
    setDataUltimoPedido(pedido.dataUltimoPedido);
    setConsumoDiario(pedido.consumoDiario);
    setItensPedido(pedido.itens);
    setObservacao(pedido.observacao || '');
    setPrevisao(pedido);
  };

  // Estilos baseados no tema para inputs
  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: `1px solid ${currentTheme.borderColor}`,
    borderRadius: '4px',
    boxSizing: 'border-box',
    backgroundColor: currentTheme.inputBg,
    color: currentTheme.inputText
  };

  const selectStyle = {
    width: '100%',
    padding: '8px',
    border: `1px solid ${currentTheme.borderColor}`,
    borderRadius: '4px',
    boxSizing: 'border-box',
    backgroundColor: currentTheme.inputBg,
    color: currentTheme.inputText
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: currentTheme.background,
      color: currentTheme.textSecondary,
      padding: '15px',
      fontFamily: 'Arial',
      position: 'relative',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      
      {/* CSS Responsivo e Animações */}
      <style>{`
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        
        @media (max-width: 768px) {
          .grid-3 { grid-template-columns: 1fr 1fr; }
          .btn-alert { padding: 8px 14px !important; font-size: 13px !important; }
        }
        @media (max-width: 480px) {
          .grid-3 { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
          h2 { font-size: 20px !important; }
          h4 { font-size: 16px !important; }
          .btn-alert { padding: 6px 12px !important; font-size: 12px !important; border-radius: 20px !important; }
          .btn-alert span { font-size: 11px !important; padding: 1px 6px !important; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* BOTÃO DARK/LIGHT MODE - Canto Superior Esquerdo */}
      <div style={{
        position: 'fixed',
        top: '15px',
        left: '15px',
        zIndex: 9999,
      }}>
        <button
          onClick={toggleTheme}
          style={{
            padding: '10px 14px',
            backgroundColor: theme === 'light' ? '#1a237e' : '#ffb300',
            color: theme === 'light' ? 'white' : '#1a237e',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>

      {/* BOTÃO DE ALERTAS - Canto Superior Direito (mantido) */}
      <div style={{
        position: 'fixed',
        top: '15px',
        right: '15px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <button
          className="btn-alert"
          onClick={() => setMostrarAviso(!mostrarAviso)}
          style={{
            padding: '12px 20px',
            backgroundColor: pedidosUrgentes.length > 0 ? '#f44336' : '#1a237e',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: pedidosUrgentes.length > 0 ? 'pulse 2s infinite' : 'none'
          }}
        >
          🔔 Alertas
          {pedidosUrgentes.length > 0 && (
            <span style={{
              backgroundColor: 'white',
              color: '#f44336',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {pedidosUrgentes.length}
            </span>
          )}
        </button>
        {pedidosUrgentes.length > 0 && (
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#f44336',
            borderRadius: '50%',
            animation: 'pulse 1s infinite'
          }} />
        )}
      </div>

      {/* MODAL DE AVISO */}
      {mostrarAviso && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '15px'
        }} onClick={() => setMostrarAviso(false)}>
          <div style={{
            backgroundColor: currentTheme.cardBackground,
            color: currentTheme.textSecondary,
            borderRadius: '16px',
            padding: '25px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMostrarAviso(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: currentTheme.textSecondary }}>✕</button>
            <h2 style={{ color: '#f44336', marginTop: 0 }}>🚨 CLIENTES URGENTES</h2>
            {pedidosUrgentes.length === 0 ? (
              <p>🎉 Nenhum cliente urgente no momento!</p>
            ) : (
              <>
                <p>{pedidosUrgentes.length} cliente(s) precisam de contato imediato!</p>
                {pedidosUrgentes.map((p, i) => (
                  <div key={i} style={{ border: '1px solid #f44336', borderRadius: '8px', padding: '12px', marginBottom: '10px', backgroundColor: theme === 'light' ? '#ffebee' : '#2a1212' }}>
                    <strong>{p.cliente}</strong>
                    <div>Último pedido: {p.dataUltimoPedido}</div>
                    <div>Próxima compra: {p.dataProximaCompra}</div>
                    <div>Dias restantes: {p.diasParaProxima}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ color: currentTheme.textPrimary, textAlign: 'center' }}>🧼 Previsão de Pedidos - Higyés</h2>
        <p style={{ textAlign: 'center', color: currentTheme.textMuted }}>Monte o pedido e calcule quando o cliente deve comprar novamente</p>

        {/* Dados do Cliente */}
        <div style={{ backgroundColor: currentTheme.cardBackground, padding: '15px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${currentTheme.borderColor}`, boxShadow: currentTheme.shadow }}>
          <h4 style={{ marginTop: 0, color: currentTheme.textPrimary }}>📋 Dados do Cliente</h4>
          <div className="grid-3">
            <div>
              <label><strong>Cliente *</strong></label>
              <input type="text" value={clienteAtual} onChange={(e) => setClienteAtual(e.target.value)} placeholder="Nome" style={inputStyle} />
            </div>
            <div>
              <label><strong>Data do último pedido *</strong></label>
              <input type="date" value={dataUltimoPedido} onChange={(e) => setDataUltimoPedido(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label><strong>Consumo médio diário (caixas/dia)</strong></label>
              <input type="number" value={consumoDiario} onChange={(e) => setConsumoDiario(Number(e.target.value))} step="0.1" min="0.1" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label><strong>Observações (opcional)</strong></label>
            <input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex: pedido grande, promoção..." style={inputStyle} />
          </div>
        </div>

        {/* Itens do Pedido */}
        <div style={{ backgroundColor: currentTheme.cardBackground, padding: '15px', borderRadius: '8px', border: `1px solid ${currentTheme.borderColor}`, marginBottom: '20px', boxShadow: currentTheme.shadow }}>
          <h4 style={{ marginTop: 0, color: currentTheme.textPrimary }}>🛒 Itens do Pedido</h4>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'flex-end' }}>
            <div style={{ flex: '2 1 150px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: currentTheme.textSecondary }}>Produto</label>
              <select 
                value={produtoSelecionado} 
                onChange={(e) => setProdutoSelecionado(Number(e.target.value))} 
                style={selectStyle}
              >
                {catalogoProdutos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.linha})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '0 1 80px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: currentTheme.textSecondary }}>Qtd</label>
              <input 
                type="number" 
                value={quantidadeItem} 
                onChange={(e) => setQuantidadeItem(Number(e.target.value))} 
                min="1" 
                style={inputStyle} 
              />
            </div>
            <div style={{ flex: '0 1 120px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: currentTheme.textSecondary }}>Preço unit.</label>
              <input 
                type="number" 
                value={precoItem} 
                onChange={(e) => setPrecoItem(Number(e.target.value))} 
                min="0" 
                step="0.01" 
                style={inputStyle} 
              />
            </div>
            <div style={{ flex: '0 1 auto' }}>
              <button 
                onClick={adicionarItem} 
                style={{ padding: '8px 16px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '38px' }}
              >
                Adicionar
              </button>
            </div>
          </div>

          {itensPedido.length === 0 ? (
            <p style={{ color: currentTheme.textMuted }}>Nenhum item adicionado.</p>
          ) : (
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead>
                  <tr style={{ backgroundColor: currentTheme.tableHeader, color: theme === 'light' ? '#333' : '#fff' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Produto</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Qtd</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Preço</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Subtotal</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {itensPedido.map(item => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${currentTheme.borderColor}`, color: currentTheme.textSecondary }}>
                      <td style={{ padding: '8px' }}>{item.nome}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantidade}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>R$ {item.preco.toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>R$ {item.subtotal.toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => removerItem(item.id)} style={{ padding: '4px 8px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', backgroundColor: theme === 'light' ? '#f9f9f9' : '#2a2a2a', color: currentTheme.textSecondary }}>
                    <td colSpan="1" style={{ padding: '8px' }}>TOTAIS</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{totalCaixas} caixas</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}></td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>R$ {totalValor.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Botões principais */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button onClick={calcularPrevisao} style={{ padding: '12px 24px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: '1 1 200px', fontWeight: 'bold' }}>🔮 Calcular Previsão</button>
          <button onClick={resetarFormulario} style={{ padding: '12px 24px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: '1 1 120px' }}>🗑️ Limpar</button>
        </div>

        {/* Resultado da Previsão */}
        {previsao && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: currentTheme.cardBackground, borderRadius: '8px', border: `3px solid ${previsao.cor}`, boxShadow: currentTheme.shadow }}>
            <h3 style={{ margin: '0 0 15px 0', color: currentTheme.textPrimary }}>📈 Previsão para {previsao.cliente}</h3>
            <div style={{ backgroundColor: previsao.cor + '20', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <h4 style={{ margin: '0', fontSize: '20px', color: previsao.cor }}>{previsao.status}</h4>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: currentTheme.textMuted }}>{previsao.statusDesc}</p>
            </div>
            <div className="grid-2">
              <div>
                <p><strong>Total de caixas:</strong> {previsao.totalCaixas}</p>
                <p><strong>Valor total:</strong> R$ {previsao.totalValor.toFixed(2)}</p>
                <p><strong>Consumo diário:</strong> {previsao.consumoDiario} caixas/dia</p>
              </div>
              <div>
                <p><strong>Último pedido:</strong> {previsao.dataUltimoPedido}</p>
                <p><strong>Próxima compra:</strong> <span style={{ fontWeight: 'bold', color: previsao.cor }}>{previsao.dataProximaCompra}</span></p>
                <p><strong>Dias até próxima compra:</strong> <span style={{ fontWeight: 'bold', color: previsao.cor }}>{previsao.diasParaProxima} dias</span></p>
              </div>
            </div>
            {previsao.observacao && <p><strong>Observação:</strong> {previsao.observacao}</p>}
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: currentTheme.alertBg, borderRadius: '4px', textAlign: 'center' }}>
              <strong>📞 Recomendação:</strong> Entre em contato com o cliente em <span style={{ fontWeight: 'bold', color: previsao.cor }}>{previsao.dataProximaCompra}</span>
            </div>
          </div>
        )}

        {/* Histórico */}
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button onClick={() => setMostrarHistorico(!mostrarHistorico)} style={{ padding: '10px 20px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {mostrarHistorico ? '📕 Esconder Histórico' : '📖 Mostrar Histórico'} ({historicoPedidos.length})
            </button>
            {historicoPedidos.length > 0 && (
              <button onClick={limparHistorico} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Limpar Histórico</button>
            )}
          </div>

          {mostrarHistorico && historicoPedidos.length > 0 && (
            <div className="table-wrap" style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px', backgroundColor: currentTheme.cardBackground, borderRadius: '8px', padding: '10px', border: `1px solid ${currentTheme.borderColor}` }}>
              {historicoPedidos.map((pedido, index) => (
                <div key={pedido.id} onClick={() => carregarPedido(pedido)} style={{ cursor: 'pointer', padding: '12px', margin: '5px 0', backgroundColor: index % 2 === 0 ? currentTheme.tableRowEven : currentTheme.tableRowOdd, borderRadius: '4px', borderLeft: `4px solid ${pedido.cor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                    <div>
                      <strong>{pedido.cliente}</strong> - {pedido.totalCaixas} caixas - R$ {pedido.totalValor.toFixed(2)}
                      {pedido.status.includes('URGENTE') && <span style={{ marginLeft: '10px', backgroundColor: '#f44336', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>🚨 URGENTE</span>}
                    </div>
                    <div>
                      <span style={{ backgroundColor: pedido.cor, color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>{pedido.diasParaProxima} dias</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: currentTheme.textMuted, marginTop: '4px' }}>Próxima compra: {pedido.dataProximaCompra} | Criado em: {pedido.dataCriacao}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', padding: '10px', textAlign: 'center', fontSize: '12px', color: currentTheme.textMuted }}>
          <p>💡 Clique em um pedido do histórico para carregar os dados</p>
          <p>© 2026 Higyés - Sistema de Previsão de Pedidos</p>
        </div>
      </div>
    </div>
  );
}

export default App;