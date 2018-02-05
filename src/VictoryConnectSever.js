var logger = require('disnode-logger');
var net = require('net');
var ConnectionManager = require('./ConnectionManager')


var server = net.createServer()

server.on("error", (error)=>{

  logger.Error("VCServer", "ServerError", "Error: " + error)

});

server.on("connection", (con)=>{
  var remoteAddress = con.remoteAddress + ':' + con.remotePort;
  logger.Success("VCServer", "Connection", "New Client Connected: " + remoteAddress)
  ConnectionManager.newConnection(con);
});

server.listen(9000, function() {
  logger.Success("VCServer", "Listen", "Server Started! " )
});
