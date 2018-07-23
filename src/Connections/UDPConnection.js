const Logger = require("disnode-logger");
const Util = require('../Util');

module.exports.Start = (settings) =>{
    this.settings = settings;
    this.type = "UDP";
    this.name = "UDP Server";
    Logger.Info("UDPConnection", "Init", `Starting UDP server with settings:\n ${JSON.stringify(settings.port, " ", 2)}\n`)

    var self = this;

    return new Promise((resolve, reject)=>{
        
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

module.exports.BindOnMessage = (callback) =>{
    this.OnMessageBind = callback;
}

module.exports.BindOnError = (callback) =>{
    this.OnErrorBind = callback;
}

module.exports.SendMessage = (callback) =>{

}

