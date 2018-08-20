const Logger = require("disnode-logger");
const Util = require('../Util');
const Dgram = require('dgram');
const Config = require("../config")
const ConnectionManager = require("./ConnectionManager")
const MessageRecviever = require("../MessageReciver")

module.exports.Start = (settings) => {
    this.settings = settings;
    this.type = "UDP";
    this.name = "UDP Server";
    this.sockets = {};
    this.socketID = 0;
    Logger.Info("UDPConnection", "Init", `Starting UDP server with settings: ${JSON.stringify(settings)}`)

    var self = this;

    return new Promise((resolve, reject) => {
        self.server = Dgram.createSocket("udp4");

        self.server.on("message", (msg, rInfo) => {

            var foundSocket_ = self.CheckForSocket(rInfo);

            if (!foundSocket_) {


                rInfo.id = "UDPSOCK-" + this.socketID;
                this.sockets["UDPSOCK-" + this.socketID] = rInfo;
                this.socketID++;
                Logger.Info("UDPConnection", "UDPEvent-connection", `Unknown Packet Recieved! Assuming new client ${rInfo.address}:${rInfo.port}. Giving ID: ${rInfo.id}`);
                self.OnData(rInfo, msg.toString());
            } else {
                self.OnData(foundSocket_, msg.toString());
            }
        });
        self.server.on("error", (err) => { Logger.Warning("UDPConnection", "UDPEvent-error", err.message) });

        self.server.on("listening", () => {
            self.OnStartBind(this);
            ConnectionManager.RegisterConnection(self.type, self);
            return resolve();
        });

        self.server.bind(self.settings.port || 4056);

    })

}

module.exports.SendSocket = (socketID, msg) => {
    this.server.send(msg, this.sockets[socketID].port, this.sockets[socketID].address);
}
module.exports.GetSocketID = (socket) => {

}

module.exports.CheckForSocket = (rInfo) => {
    var found = null;
    for (var i = 0; i < Object.keys(this.sockets).length; i++) {
        var socket = this.sockets[Object.keys(this.sockets)[i]];
        if (rInfo.address == socket.address && rInfo.port == socket.port) {
            found = socket;
        }
    }
    return found;
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

