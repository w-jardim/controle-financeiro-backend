const http = require('http');
const loginPayload = JSON.stringify({ email: 'wallace@teste.com', senha: '123456' });
const lopts = { hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) } };
const lreq = http.request(lopts, res => {
  let b = '';
  res.on('data', d => b += d);
  res.on('end', () => {
    try {
      const j = JSON.parse(b);
      const token = j.dados.token;
      console.log('LOGIN', res.statusCode);
      const opts = { hostname: 'localhost', port: 3000, path: '/api/cts', method: 'GET', headers: { 'Authorization': 'Bearer ' + token } };
      const req = http.request(opts, res2 => {
        let r = '';
        res2.on('data', d => r += d);
        res2.on('end', () => {
          console.log('CTS', res2.statusCode);
          try { console.log(JSON.parse(r)); } catch (e) { console.log(r); }
        });
      });
      req.on('error', e => console.error('ERR2', e.message));
      req.end();
    } catch (e) {
      console.error('LOGIN_ERR', e.message, b);
    }
  });
});
lreq.on('error', e => console.error('ERR', e.message));
lreq.write(loginPayload);
lreq.end();
