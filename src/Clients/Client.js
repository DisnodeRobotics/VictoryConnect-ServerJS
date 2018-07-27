const Logger = require("disnode-logger");
const ClientManager = require("./ClientManager");
const Consts = require("../Consts")
const Util = require("../Util")
const MessageReciver = require("../MessageReciver")
class Client{
    constructor(connection, socket){
        this.connection = connection;
        this.socket     = socket;
        this.active     = false;
        this.registered = false;
        this.id         = ClientManager.RequestID();
        
        Logger.Success(`Client-${this.id}`, "constructor", "New Client Made!")

        ClientManager.AddClient(this);
        var self = this;
        socket.on("error", this.OnError)
        socket.on("data", (data)=>{
            MessageReciver.OnMessage(data.toString(), self);
        });

        Logger.Info(`Client-${this.id}`, "constructor", "Sending Client Info ID Packet")
        this.SendPacket(Consts.types.SUBMIT, "client/info/id", [this.id]);
    }
    OnError(err){
        Logger.Error(`Client-${this.id}`, "Socket Error", err)
    }
    OnPacket(packet){
        
    }

    SendPacket(msgType, topic, data){
        var packetString = Util.buildPacket(msgType,topic,data);
        this.connection.Send(packetString, this);
    }


    StartHeartbeat(){
        
    }

    SendHeartbeat(){

    }

    RecvHeartbeat(){

    }
    
}

module.exports = Client;