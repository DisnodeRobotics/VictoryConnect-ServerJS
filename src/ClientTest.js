const dgram = require('dgram');


const message = Buffer.from("1 3 gyro x=10;y=20;z=10");
const client = dgram.createSocket('udp4');
setInterval(function () {
  client.send(message, 5100, 'localhost', (err) => {

  });
}, 10);
