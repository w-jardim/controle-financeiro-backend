/**
 * helpers/operacoes.js
 * Funções de setup reutilizáveis para testes da fase Operações:
 *   agenda-aulas, agendamentos, presenças.
 */
const request = require('supertest');
const app = require('../../src/app');

/**
 * Cria a estrutura base: CT + Profissional + Modalidade.
 * @returns { token, ctId, profId, modId }
 */
async function criarBase(token) {
  const ct = await request(app)
    .post('/cts')
    .set('Authorization', `Bearer ${token}`)
    .send({ nome: `CT Op ${Date.now()}` });
  if (ct.status !== 201) throw new Error(`CT falhou: ${JSON.stringify(ct.body)}`);
  const ctId = ct.body.dados.id;

  const prof = await request(app)
    .post('/profissionais')
    .set('Authorization', `Bearer ${token}`)
    .send({ nome: `Prof Op ${Date.now()}` });
  if (prof.status !== 201) throw new Error(`Profissional falhou: ${JSON.stringify(prof.body)}`);
  const profId = prof.body.dados.id;

  const mod = await request(app)
    .post('/modalidades')
    .set('Authorization', `Bearer ${token}`)
    .send({ nome: `Mod Op ${Date.now()}` });
  if (mod.status !== 201) throw new Error(`Modalidade falhou: ${JSON.stringify(mod.body)}`);
  const modId = mod.body.dados.id;

  return { ctId, profId, modId };
}

/**
 * Cria um aluno vinculado a um CT.
 */
async function criarAluno(token, ctId, nome = `Aluno ${Date.now()}`) {
  const res = await request(app)
    .post('/alunos')
    .set('Authorization', `Bearer ${token}`)
    .send({ nome, ct_id: ctId });
  if (res.status !== 201) throw new Error(`Aluno falhou: ${JSON.stringify(res.body)}`);
  return res.body.dados.id;
}

/**
 * Cria um horário-aula.
 */
async function criarHorario(token, { ctId, profId, modId, diaSemana = 1, horaInicio = '09:00:00', horaFim = '10:00:00' } = {}) {
  const res = await request(app)
    .post('/horarios-aula')
    .set('Authorization', `Bearer ${token}`)
    .send({
      ct_id: ctId,
      profissional_id: profId,
      modalidade_id: modId,
      dia_semana: diaSemana,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
    });
  if (res.status !== 201) throw new Error(`Horário falhou: ${JSON.stringify(res.body)}`);
  return res.body.dados.id;
}

/**
 * Cria uma agenda-aula manualmente.
 */
async function criarAgendaAula(token, { ctId, profId, modId, dataAula = '2026-05-05', horaInicio = '09:00', horaFim = '10:00' } = {}) {
  const res = await request(app)
    .post('/agenda-aulas')
    .set('Authorization', `Bearer ${token}`)
    .send({
      ct_id: ctId,
      profissional_id: profId,
      modalidade_id: modId,
      data_aula: dataAula,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
    });
  if (res.status !== 201) throw new Error(`AgendaAula falhou: ${JSON.stringify(res.body)}`);
  return res.body.dados.id;
}

/**
 * Cria um agendamento via horário-aula.
 */
async function criarAgendamento(token, { alunoId, horarioId, dataAula = '2026-05-05' } = {}) {
  const res = await request(app)
    .post('/agendamentos')
    .set('Authorization', `Bearer ${token}`)
    .send({ aluno_id: alunoId, horario_aula_id: horarioId, data_aula: dataAula });
  if (res.status !== 201) throw new Error(`Agendamento falhou: ${JSON.stringify(res.body)}`);
  return res.body.dados.id;
}

module.exports = { criarBase, criarAluno, criarHorario, criarAgendaAula, criarAgendamento };
