// Converte datas ISO ou antigas datas brasileiras para uma data local, sem deslocamento de fuso.
export function parseData(data) {
  if (!data) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const brasileira = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  const partes = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : brasileira
      ? [Number(brasileira[3]), Number(brasileira[2]), Number(brasileira[1])]
      : null;

  if (!partes) return null;
  const [ano, mes, dia] = partes;
  const resultado = new Date(ano, mes - 1, dia);
  return resultado.getFullYear() === ano && resultado.getMonth() === mes - 1 && resultado.getDate() === dia
    ? resultado
    : null;
}

// Exibe datas sempre no padrão usado no Brasil.
export function formatarData(data) {
  const dataLocal = parseData(data);
  return dataLocal ? dataLocal.toLocaleDateString('pt-BR') : 'Não definida';
}

// Usa datas de referência aproximadas das estações astronômicas no Brasil.
export function obterEstacao(data) {
  const dataLocal = parseData(data);
  if (!dataLocal) return 'Não definida';

  const mes = dataLocal.getMonth() + 1;
  const dia = dataLocal.getDate();
  if (mes === 12 && dia >= 21 || mes < 3 || mes === 3 && dia < 20) return 'Verão';
  if (mes === 3 && dia >= 20 || mes > 3 && mes < 6 || mes === 6 && dia <= 20) return 'Outono';
  if (mes === 6 && dia >= 21 || mes > 6 && mes < 9 || mes === 9 && dia <= 22) return 'Inverno';
  return 'Primavera';
}

// Calcula dias inteiros entre datas usando UTC para evitar diferenças de horário de verão.
function diasEntre(inicio, fim) {
  const inicioUtc = Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  const fimUtc = Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate());
  return Math.round((fimUtc - inicioUtc) / 86400000);
}

// Mede o prazo até uma data prevista usando a mesma regra de dias inteiros.
export function diasEntreDatas(inicio, fim) {
  const dataInicio = parseData(inicio);
  const dataFim = parseData(fim);
  return dataInicio && dataFim ? diasEntre(dataInicio, dataFim) : null;
}

// Estima caixas/dia com os pedidos anteriores do mesmo cliente, sem usar dados de outros comércios.
export function estimarConsumoDiario(cliente, dataPedidoAtual, historico) {
  const dataAtual = parseData(dataPedidoAtual);
  if (!dataAtual) return null;

  const nomeCliente = cliente.trim().toLocaleLowerCase('pt-BR');
  const pedidos = historico
    .filter((pedido) => pedido.cliente?.trim().toLocaleLowerCase('pt-BR') === nomeCliente)
    .map((pedido) => ({ pedido, data: parseData(pedido.dataUltimoPedido) }))
    .filter(({ pedido, data }) => data && data < dataAtual && Number(pedido.totalCaixas) > 0)
    .sort((a, b) => a.data - b.data);

  // Ignora previsões repetidas para a mesma data, mantendo um único pedido por dia.
  const pedidosSemDuplicatas = pedidos.filter(
    (registro, indice) => indice === 0 || diasEntre(pedidos[indice - 1].data, registro.data) > 0
  );
  let caixasObservadas = 0;
  let diasObservados = 0;

  // Cada intervalo representa o estoque do pedido anterior consumido até a compra seguinte.
  pedidosSemDuplicatas.forEach(({ pedido, data }, indice) => {
    const proximaData = pedidosSemDuplicatas[indice + 1]?.data ?? dataAtual;
    const dias = diasEntre(data, proximaData);
    if (dias > 0) {
      caixasObservadas += Number(pedido.totalCaixas);
      diasObservados += dias;
    }
  });

  // Sem intervalo entre compras, não há base real para estimar o consumo.
  return diasObservados > 0 ? caixasObservadas / diasObservados : null;
}

// Soma dias à data do pedido sem interpretar YYYY-MM-DD como UTC.
export function adicionarDias(data, dias) {
  const dataLocal = parseData(data);
  if (!dataLocal) return null;
  dataLocal.setDate(dataLocal.getDate() + dias);
  const ano = dataLocal.getFullYear();
  const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
  const dia = String(dataLocal.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Converte uma data válida para o formato ISO usado nos cálculos e alertas.
export function paraDataISO(data) {
  const dataLocal = parseData(data);
  if (!dataLocal) return null;
  const ano = dataLocal.getFullYear();
  const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
  const dia = String(dataLocal.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
