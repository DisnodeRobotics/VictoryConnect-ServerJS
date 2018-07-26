const Logger = require("disnode-logger");
const ClientManager = require("./ClientManager");
const Consts = require("../Consts")
class Client{
    constructor(connection, socket){
        this.connection = connection;
        this.socket     = socket;
        this.active     = false;
        this.registered = false;
        this.id         = ClientManager.RequestID();

        ClientManager.AddClient(this);

        this.SendPacket(Consts.types.SUBMIT, "client/info", [this.id])
    }

    OnPacket(packet){
        
    }

    SendPacket(msgType, topic, data){

    }


    StartHeartbeat(){
        
    }

    SendHeartbeat(){

    }

    RecvHeartbeat(){

    }
    
}