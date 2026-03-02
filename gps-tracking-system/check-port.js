const net = require('net');

const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Port 3000 is in use');
    process.exit(1);
  }
});

server.once('listening', () => {
  console.log('Port 3000 is available');
  server.close();
});

server.listen(3000);
