const Logger = require("disnode-logger");
const Util = require('../Util');
const Consts = require('../Consts')
const Net = require('net');
const Config = require("../config")
const ConnectionManager = require("./ConnectionManager")
const MessageRecviever = require("../MessageReciver")
const ClientManager = require("../Clients/ClientManager")

module.exports.Start = (settings) => {
    this.settings = settings;
    this.type = "TCP";
    this.name = "TCP Server";
    this.sockets = {};
    this.socketID = 0;
    Logger.Info("TCPConnection", "Init", `Starting TCP server with settings:\n --- ${JSON.stringify(settings, " ", 2)}`)

    var self = this;

    return new Promise((resolve, reject) => {
        self.server = Net.createServer();
        self.server.on("connection", (newCon) => {
            Logger.Info("TCPConnection", "TCPEvent-connection", "New Connection recieved! Binding data events");
            

            this.sockets["TCPSOCK-" + this.socketID] = newCon;
            newCon.id = "TCPSOCK-" + this.socketID
            this.socketID++;

            newCon.on("data", (data) => { self.OnData(newCon, data.toString()) });
            newCon.on("error", (err) => { 
                Logger.Warning("TCPConnection-"+newCon.id, "TCPEvent-error", err.message) 
                const client = ClientManager.GetClient(ClientManager.GetClientIDBySocketID(newCon.id, "TCP"));
                if(client){
                    client.KillConnection("TCP")
                }else{
                    Logger.Error("TCPConnection-"+newCon.id, "TCPEvent-error", "Failed to kill socket. Could not locate client! ") 
                }
            });
           // this.SendSocket(newCon.id, Util.buildPacket(Consts.types.COMMAND, "welcome", [newCon.id]))


        });
        self.server.on("error", (err) => { Logger.Warning("TCPConnection", "TCPEvent-error", err.message) });

        self.server.listen(self.settings.port || 4056, () => {
            self.OnStartBind(this);
            ConnectionManager.RegisterConnection(self.type, self);
            return resolve();
        });
    })

}

module.exports.SendSocket = (socketID, msg) => {
    this.sockets[socketID].write(msg);
}
module.exports.GetSocketID = (socket) => {
    
}

module.exports.Stop = (callback) => {
}


module.exports.OnData = (socket, data) => {
    MessageRecviever.OnMessage(data, socket.id, this.type);
}
// Binds

module.exports.BindOnStart = (callback) => {
    this.OnStartBind = callback;
}

module.exports.BindOnConnection = (callback) => {
    this.OnConnectionBind = callback;
}

module.exports.BindOnError = (callback) => {
    this.OnErrorBind = callback;
}

