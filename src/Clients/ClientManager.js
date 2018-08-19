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
    for(var i=0;i<Object.keys(clients).length;i++){
        const _obj = clients[Object.keys(clients)[i]];
        if(_obj.sockets[conType] == socketID){
            found = _obj;
          
        }
    }
    if(found){
        return found.id;
    }else{
        return -1;
    }
    
}