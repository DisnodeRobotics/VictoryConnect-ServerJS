const Logger = require('disnode-logger');

var clients = [];

module.exports.RequestID = () =>{
    return clients.length;
}

module.exports.AddClient = (client) =>{
    clients[client.id] = client;
    
}

