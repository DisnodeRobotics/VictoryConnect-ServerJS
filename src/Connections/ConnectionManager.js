const Logger = require('disnode-logger');

var ConnectionMappings = {};

module.exports.RegisterConnection = (conType, connection) =>{
    Logger.Success("ConnectionManager", "RegisterConnection", "Registered new connection: " + conType);
    ConnectionMappings[conType] = connection;
}

module.exports.GetConnection = (conType) =>{
    return ConnectionMappings[conType];
}

module.exports.SendString = (data, conType, socketInfo) =>{
    const _con = this.GetConnection(conType);
    _con.SendSocket(socketInfo, data);
}
