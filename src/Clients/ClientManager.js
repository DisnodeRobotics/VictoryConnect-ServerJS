const Logger = require('disnode-logger');

var clients = [];

module.exports.RequestID = () =>{
    return clients.length;
}

module.exports.AddClient = (client) =>{
    Logger.Info("ClientManager", "AddClient", `Client ${client.id} added!`)
    clients[client.id] = client;

}

