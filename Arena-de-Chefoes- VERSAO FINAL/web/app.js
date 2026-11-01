/**
 * Desafio do aluno: conectar os botões à API Java e atualizar a interface.
 * A página é servida pelo próprio Java em http://localhost:8080.
 */
const TIMES = [
  { nome:'Athletico-PR',  sigla:'CAP', apelido:'O Furacão',          cor1:'#c8102e', cor2:'#000000' },
  { nome:'Atlético-MG',   sigla:'CAM', apelido:'O Galo',             cor1:'#000000', cor2:'#ffffff' },
  { nome:'Bahia',         sigla:'BAH', apelido:'O Esquadrão',        cor1:'#0057b8', cor2:'#ffffff' },
  { nome:'Botafogo',      sigla:'BOT', apelido:'O Glorioso',         cor1:'#111111', cor2:'#ffffff' },
  { nome:'Bragantino',    sigla:'RBB', apelido:'A Massa Bruta',      cor1:'#d71920', cor2:'#ffffff' },
  { nome:'Chapecoense',   sigla:'CHA', apelido:'O Verdão do Oeste',  cor1:'#1a9a4a', cor2:'#ffffff' },
  { nome:'Coritiba',      sigla:'CFC', apelido:'O Coxa',             cor1:'#0b6b3a', cor2:'#ffffff' },
  { nome:'Cruzeiro',      sigla:'CRU', apelido:'A Raposa',           cor1:'#1450a3', cor2:'#ffffff' },
  { nome:'Flamengo',      sigla:'FLA', apelido:'O Mengão',           cor1:'#c8102e', cor2:'#000000' },
  { nome:'Fluminense',    sigla:'FLU', apelido:'O Tricolor',         cor1:'#7a0f2e', cor2:'#ffffff' },
  { nome:'Grêmio',        sigla:'GRE', apelido:'O Imortal',          cor1:'#0d80bf', cor2:'#000000' },
  { nome:'Internacional', sigla:'INT', apelido:'O Colorado',         cor1:'#e5050f', cor2:'#ffffff' },
  { nome:'Mirassol',      sigla:'MIR', apelido:'O Leão da Alta Paulista', cor1:'#f2c500', cor2:'#0a7a2f' },
  { nome:'Palmeiras',     sigla:'PAL', apelido:'O Verdão',           cor1:'#006437', cor2:'#ffffff' },
  { nome:'Remo',          sigla:'REM', apelido:'O Leão Azul',        cor1:'#0a2a6b', cor2:'#ffffff' },
  { nome:'Santos',        sigla:'SAN', apelido:'O Peixe',            cor1:'#ffffff', cor2:'#000000' },
  { nome:'São Paulo',     sigla:'SAO', apelido:'O Tricolor Paulista',cor1:'#e5050f', cor2:'#000000' },
  { nome:'Vasco',         sigla:'VAS', apelido:'O Gigante da Colina',cor1:'#000000', cor2:'#ffffff' },
  { nome:'Vitória',       sigla:'VIT', apelido:'O Leão da Barra',    cor1:'#d71920', cor2:'#000000' }
];

const seletor = document.querySelector('#adversario');
let ultimoResultado = 'em_andamento';

TIMES.forEach((time, i) => {
  const opcao = document.createElement('option');
  opcao.value = i;
  opcao.textContent = time.nome;
  seletor.appendChild(opcao);
});

function aplicarAdversario(indice) {
  const time = TIMES[indice];
  const chefe = document.querySelector('.chefe');
  chefe.style.setProperty('--cor1', time.cor1);
  chefe.style.setProperty('--cor2', time.cor2);
  document.querySelector('#adv-nome').textContent = time.nome;
  document.querySelector('#adv-sigla').textContent = time.sigla;
  document.querySelector('#adv-apelido').textContent = time.apelido;
  seletor.value = indice;
}

seletor.addEventListener('change', () => aplicarAdversario(Number(seletor.value)));
aplicarAdversario(8); // começa contra o Flamengo

const botoes = document.querySelectorAll('[data-acao]');
const botaoReiniciar = document.querySelector('#reiniciar');

async function carregarEstado() {
  const resposta = await fetch('/api/estado');
  const dados = await resposta.json();
  renderizar(dados);
}

async function enviarAcao(acao) {
  try {
    const resposta = await fetch('/api/jogar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ acao })
    });
    if (!resposta.ok) throw new Error('Resposta ' + resposta.status);
    const dados = await resposta.json();
    renderizar(dados);
  } catch (erro) {
    document.querySelector('#mensagem').textContent = 'Falha ao falar com o Java: ' + erro.message;
  }
}

function atualizarBarra(id, atual, maximo) {
  const porcentagem = Math.max(0, Math.min(100, (atual / maximo) * 100));
  document.querySelector(id).style.width = porcentagem + '%';
}

function renderizar(dados) {
  document.querySelector('#vida-jogador-texto').textContent = `${dados.jogadorVida} / ${dados.jogadorMax} PV`;
  document.querySelector('#vida-chefe-texto').textContent = `${dados.chefeVida} / ${dados.chefeMax} PV`;
  document.querySelector('#pocoes').textContent = dados.pocoes;
  document.querySelector('#turno').textContent = `Turno ${dados.turno}`;
  document.querySelector('#mensagem').textContent = dados.mensagem;

  atualizarBarra('#barra-jogador', dados.jogadorVida, dados.jogadorMax);
  atualizarBarra('#barra-chefe', dados.chefeVida, dados.chefeMax);

  botoes.forEach(botao => { botao.disabled = dados.encerrado; });

  const resultado = document.querySelector('#resultado');
  ultimoResultado = dados.resultado;
  const adversario = TIMES[Number(seletor.value)].nome;
  if (dados.resultado === 'vitoria') {
    resultado.textContent = `🏆 VITÓRIA! O Timão bateu o ${adversario}! Vai pra próxima rodada!`;
  } else if (dados.resultado === 'derrota') {
    resultado.textContent = `💀 DERROTA! O ${adversario} levou os 3 pontos desta vez.`;
  } else {
    resultado.textContent = '';
  }

  const aviso = document.querySelector('#aviso');
  aviso.textContent = dados.aviso;
  aviso.classList.toggle('especial', dados.aviso.includes('ESPECIAL'));

  const furia = document.querySelector('#furia');
  furia.hidden = !(dados.furia && !dados.encerrado);
  document.querySelector('.chefe').classList.toggle('em-furia', dados.furia);
}

botoes.forEach(botao => {
  botao.addEventListener('click', () => enviarAcao(botao.dataset.acao));
});

botaoReiniciar.addEventListener('click', async () => {
  if (ultimoResultado === 'vitoria') {
    aplicarAdversario((Number(seletor.value) + 1) % TIMES.length);
  }
  const resposta = await fetch('/api/reiniciar', { method: 'POST' });
  const dados = await resposta.json();
  renderizar(dados);
});

carregarEstado().catch(erro => {
  document.querySelector('#mensagem').textContent = 'Falha ao conectar ao Java: ' + erro.message;
});