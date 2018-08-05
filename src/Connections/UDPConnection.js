const Logger = require("disnode-logger");
const Util = require('../Util');
const Datagram = require ('dgram');
const Config = require("../config")
const ConnectionManager = require("./ConnectionManager")
module.exports.Start = (settings) =>{
    this.settings = settings;
    this.type = "UDP";
    this.name = "UDP Server";

    Logger.Info("UDPConnection", "Init", `Starting UDP server with settings:\n ${JSON.stringify(settings, " ", 2)}`)

    var self = this;
    
    return new Promise((resolve, reject)=>{
        self.server = Datagram.createSocket('udp4');
        
        self.server.on("error",(err)=>{self.OnErrorBind(self, err)});
        
        self.server.on("listening", ()=>{
            self.OnStartBind(this);
            ConnectionManager.RegisterConnection(self.type, self);
            return resolve();
        });

        server.bind(self.settings.port || 4056);
    })
    
}

module.exports.SendSocket = (socketData, msg)=>{
    socketData.write(msg);
}
module.exports.Stop = (callback) =>{

}


// Binds

module.exports.BindOnStart = (callback) =>{
    this.OnStartBind = callback;
}

module.exports.BindOnConnection = (callback) =>{
    this.OnConnectionBind = callback;
}

module.exports.BindOnError = (callback) =>{
    this.OnErrorBind = callback;
}

