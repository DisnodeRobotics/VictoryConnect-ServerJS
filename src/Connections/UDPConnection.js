const Logger = require("disnode-logger");
const Util = require('../Util');
const Net = require ('net');


module.exports.Start = (settings) =>{
    this.settings = settings;
    this.type = "UDP";
    this.name = "UDP Server";
    Logger.Info("UDPConnection", "Init", `Starting UDP server with settings:\n ${JSON.stringify(settings, " ", 2)}`)

    var self = this;

    return new Promise((resolve, reject)=>{
        self.server = Net.createServer();
        self.server.on("connection", (newCon)=>{self.OnConnectionBind(self, newCon)});
        self.server.on("error",(err)=>{self.OnErrorBind(self, err)});

        self.server.listen(self.settings.port || 4056, ()=>{
            self.OnStartBind(this);
            return resolve();
        });
    })
    
}

module.exports.Stop = (callback) =>{

}

module.exports.BindOnStart = (callback) =>{
    this.OnStartBind = callback;
}

module.exports.BindOnConnection = (callback) =>{
    this.OnConnectionBind = callback;
}

module.exports.BindOnError = (callback) =>{
    this.OnErrorBind = callback;
}

