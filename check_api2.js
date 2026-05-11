const http = require('http');

async function checkAPI(port, partida) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: `/api/partidas?partida=${encodeURIComponent(partida)}`,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✓ API on port ${port} responded successfully`);
          console.log(`First insumo:`, parsed[0]);
          resolve(true);
        } catch(e) {
          console.error(`Failed to parse response from port ${port}:`, e.message);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`✗ Port ${port}: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.error(`✗ Port ${port}: timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

(async () => {
  console.log('Testing API on port 3000...');
  await new Promise(r => setTimeout(r, 1000));
  const port3000 = await checkAPI(3000, 'O.E.3.1.11.1');

  if (!port3000) {
    console.log('\nTesting API on port 3001...');
    await new Promise(r => setTimeout(r, 1000));
    await checkAPI(3001, 'O.E.3.1.11.1');
  }
})();
