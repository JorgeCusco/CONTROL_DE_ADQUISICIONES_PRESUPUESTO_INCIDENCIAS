const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/partidas?partida=O.E.3.1.11.1',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('API Response:');
    const parsed = JSON.parse(data);
    console.log(JSON.stringify(parsed.slice(0, 3), null, 2));
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

req.end();
