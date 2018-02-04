var logger = require('disnode-logger');
var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  Parse(rinfo, msg);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(5100);


function Parse(info, data){
  data = data.toString();
  var parts = data.split(" ");
  var subject = parts[0];
  var commandType = parts[1];
  var commandTopic = parts[2];
  var values = parts[3].split(";");

  var parsedValues = {};
  logger.Info("VC Server", "DataParse", `Packet from ${info.address}:${info.port} \nSubject: ${subject} \nType: ${commandType} \nTopic: ${commandTopic} \nData: ${values}`)
}
