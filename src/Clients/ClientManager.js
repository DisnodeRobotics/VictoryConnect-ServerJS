const Logger = require('disnode-logger');

var clients = {};

module.exports.RequestID = () =>{
    return clients.length;
}

module.exports.AddClient = (client) =>{
    Logger.Info("ClientManager", "AddClient", `Client ${client.id} added!`)
    clients[client.id] = client;

}

module.exports.GetClient = (clientID) =>{
    return clients[clientID];
}

module.exports.GetClientIDBySocketID = (socketID, conType) =>{
    let found = null;
    let clientKeys = Object.keys(clients)
    for(var i=0;i<clientKeys.length;i++){
        const client = clients[clientKeys[i]];
        if(!client.connections[conType]){
            return -1;
        }
        
        if(client.connections[conType].socket == socketID){
            found = client;
        }
    }
    if(found){
        return found.id;
    }else{
        return -1;
    }
    
}