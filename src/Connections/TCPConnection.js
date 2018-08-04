const Logger = require("disnode-logger");
const Util = require('../Util');
const Net = require ('net');
const Config = require("../config")
const ConnectionManager = require("./ConnectionManager")
module.exports.Start = (settings) =>{
    this.settings = settings;
    this.type = "TCP";
    this.name = "TCP Server";


    Logger.Info("TCPConnection", "Init", `Starting TCP server with settings:\n ${JSON.stringify(settings, " ", 2)}`)

    var self = this;
    
    return new Promise((resolve, reject)=>{
        self.server = Net.createServer();
        self.server.on("connection", (newCon)=>{self.OnConnectionBind(self, newCon)});
        self.server.on("error",(err)=>{self.OnErrorBind(self, err)});
        
        self.server.listen(self.settings.port || 4056, ()=>{
            self.OnStartBind(this);
            ConnectionManager.RegisterConnection(self.type, self);
            return resolve();
        });
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

