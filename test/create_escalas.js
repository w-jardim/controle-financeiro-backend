const http = require('http');
const loginPayload = JSON.stringify({ email: 'wallace@teste.com', senha: '123456' });
function request(opts, payload) {
  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}
(async () => {
  try {
    const loginRes = await request({ hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) } }, loginPayload);
    const j = JSON.parse(loginRes.body);
    const token = j.dados.token;
    const get = (path) => request({ hostname: 'localhost', port: 3000, path, method: 'GET', headers: { Authorization: 'Bearer ' + token } });
    const cts = await get('/api/cts');
    const mods = await get('/api/modalidades');
    const prof = await get('/api/profissionais');
    const ctId = JSON.parse(cts.body).dados[0].id;
    const modId = JSON.parse(mods.body).dados[0].id;
    const profId = JSON.parse(prof.body).dados[0].id;
    const intervals = [ { hora_inicio: '08:00', hora_fim: '09:00' }, { hora_inicio: '09:00', hora_fim: '10:00' }, { hora_inicio: '10:00', hora_fim: '11:00' } ];
    for (const itv of intervals) {
      const payload = JSON.stringify({ ct_id: ctId, modalidade_id: modId, profissional_id: profId, dias_semana: [2], hora_inicio: itv.hora_inicio, hora_fim: itv.hora_fim });
      const res = await request({ hostname: 'localhost', port: 3000, path: '/api/escalas', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), Authorization: 'Bearer ' + token } }, payload);
      console.log('POST', itv.hora_inicio, itv.hora_fim, res.status, res.body);
    }
    const list = await get('/api/escalas');
    console.log('LIST', list.status, JSON.parse(list.body).dados.map(e=>({id:e.id, hora_inicio:e.hora_inicio, hora_fim:e.hora_fim, dias_semana:e.dias_semana})));
    
  } catch (e) {
    console.error('ERR', e && e.message); 
  }
})();
