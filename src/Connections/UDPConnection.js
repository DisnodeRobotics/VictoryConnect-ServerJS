const Logger = require("disnode-logger");
const Util = require('../Util');
const Net = require ('net');
const Config = require("../config")

module.exports.Start = (settings) =>{
    this.settings = settings;
    this.type = "UDP";
    this.name = "UDP Server";
    this.sendBuffer = [];

    Logger.Info("UDPConnection", "Init", `Starting UDP server with settings:\n ${JSON.stringify(settings, " ", 2)}`)

    var self = this;
    
    return new Promise((resolve, reject)=>{
        self.server = Net.createServer();
        self.server.on("connection", (newCon)=>{self.OnConnectionBind(self, newCon)});
        self.server.on("error",(err)=>{self.OnErrorBind(self, err)});
        
        self.server.listen(self.settings.port || 4056, ()=>{
            self.OnStartBind(this);
            setInterval(()=>{onTick(self)}, (1000/settings.tickRate));
            Logger.Info("UDPConnection", "Init", "Started tick rate with delay: " + (1000/settings.tickRate));
            return resolve();
        });
    })
    
}


module.exports.Send = (msg, client) =>{
    this.sendBuffer.push({
        msg: msg,
        socket: client.socket,
        client: client
    });
}

module.exports.Stop = (callback) =>{

}

//Tick Logic
function onTick(ref){
    if(!ref.sendBuffer.length > 0){
        return;
    }

    let sentCount = 0;

    for (let i = 0; i < ref.sendBuffer.length; i++) {
        const _toSend = ref.sendBuffer[i];
        _toSend.socket.write(_toSend.msg);
        if(Config.verbose){
            Logger.Info("UDPConnection", `onTick`, `Sent "${_toSend.msg}" from client ${_toSend.client.id}!`);
        }
        ref.sendBuffer.splice(i,1);
        sentCount++;
    }

    if(Config.verbose){
        Logger.Success("UDPConnection", "onTick", `Sent ${sentCount} packets!`);
    }

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

