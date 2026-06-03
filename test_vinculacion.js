const http = require('http');

async function testAPI(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
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
          console.log('✓ API Response:');
          console.log(JSON.stringify(parsed.insumos?.slice(0, 3) || parsed, null, 2));
          resolve(true);
        } catch(e) {
          console.error('Failed to parse:', e.message);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('✗ Error:', err.message);
      resolve(false);
    });

    req.on('timeout', () => {
      console.error('✗ Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

(async () => {
  console.log('Testing /api/vinculacion?mode=insumos...\n');
  await testAPI('/api/vinculacion?mode=insumos');
})();
