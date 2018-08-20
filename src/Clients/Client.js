const Logger = require("disnode-logger");
const ClientManager = require("./ClientManager");
const ConnectionManager = require('../Connections/ConnectionManager')
const Topic = require('../Topics/Topic')
const TopicList = require('../Topics/TopicList')
const Consts = require("../Consts")
const Util = require("../Util")
const MessageReciver = require("../MessageReciver")
const Config = require("../config")
class Client {
    constructor(id, name) {
        this.connections = {};
        this.sockets = {};
        this.active = false;
        this.id = id;
        this.name = name;
        this.sendQueue = {};
        this.tickRate = 50;
        this.tickInterval = null;
        this.sentPackets = 0;
        this.timeout = 500;
        this.retrys = 3;
        this.failed = 0;

        Logger.Success(`Client-${this.id}`, "constructor", "New Client Made!")

        ClientManager.AddClient(this);
        var self = this;

        Logger.Info(`Client-${this.id}`, "constructor", "Sending Client Info ID Packet")

        this.SetTickLoop();

        new Topic({ name: `Client ${this.id} Tick Rate`, path: `clients/${this.id}/tickrate`, protocol: "TCP", data: this.tickRate });
        new Topic({ name: `Client ${this.id} Name`, path: `clients/${this.id}/name`, protocol: "TCP", data: this.name });
        new Topic({ name: `Client ${this.id} Sent Packets`, path: `clients/${this.id}/packets`, protocol: "TCP", data: this.sentPackets });
        new Topic({ name: `Client ${this.id} Timeout`, path: `clients/${this.id}/timeout`, protocol: "TCP", data: this.timeout });
        new Topic({ name: `Client ${this.id} Retrys`, path: `clients/${this.id}/retrys`, protocol: "TCP", data: this.retrys });

        
    }

    AddSocket(connection, socketID) {
        var self = this;
        this.connections[connection] = {
            active: true,
            socket: socketID,
            lastActive: new Date().getTime(),
            ping: 0,
            failed: 0,
            heartbeat: setInterval(()=>{
                self.CheckHeartbeat(connection);
            },self.timeout)
        };
        this.sockets[connection] = socketID;
        this.sendQueue[connection] = [];
        Logger.Info(`Client-${this.id}`, "AddSocket", `Adding new socket with type ${connection} and socket id ${socketID}, Now Active: ${JSON.stringify(this.sockets)}`);

        new Topic({
            name: `Client ${this.id} Connection ${connection} Active`, 
            path: `clients/${this.id}/connections/${connection}/active`, 
            protocol: "TCP", 
            data: this.connections[connection].active 
        });

        new Topic({
            name: `Client ${this.id} Connection ${connection} SocketID`, 
            path: `clients/${this.id}/connections/${connection}/socket`, 
            protocol: "TCP", 
            data: this.connections[connection].socket 
        });

        new Topic({
            name: `Client ${this.id} Connection ${connection} Last Active`, 
            path: `clients/${this.id}/connections/${connection}/lastactive`, 
            protocol: "TCP", 
            data: this.connections[connection].lastActive 
        });

        new Topic({
            name: `Client ${this.id} Connection ${connection} Ping`, 
            path: `clients/${this.id}/connections/${connection}/ping`, 
            protocol: "TCP", 
            data: this.connections[connection].ping 
        });

        new Topic({
            name: `Client ${this.id} Connection ${connection} Failed`, 
            path: `clients/${this.id}/connections/${connection}/failed`, 
            protocol: "TCP", 
            data: this.connections[connection].failed 
        });

        this.UpdateConnectionInfo(connection)        

        this.SendPacket(Consts.types.COMMAND, "welcome", [this.timeout]);
        var self = this;
        
    }

    UpdateConnectionInfo(conType){
        const connection = this.connections[conType];
        if(!connection){Logger.Error(`Client-${this.id}`, "UpdateConnectionInfo", `Failed to find ${conType} object!`)}
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/active`,connection.sentPackets);
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/socket`,connection.socket);
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/lastactive`,connection.lastActive);
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/ping`,connection.ping);
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/failed`,connection.failed);
    }

    KillConnection(connection) {
        this.connections[connection].active = false;
        this.sockets[connection] = null;
        this.UpdateConnectionInfo(connection);
        Logger.Info(`Client-${this.id}`, "KillConnection", `${connection} Killed!`)
        clearInterval(this.connections[connection].heartbeat);
    }

    SetTickLoop() {
        var self = this;
        this.tickInterval = setInterval(() => { self.OnSendTick(self) }, (1000 / self.tickRate));
        Logger.Info(`Client-${this.id}`, "Init", "Started tick rate with delay: " + (1000 / self.tickRate));
    }

    OnError(err) {
        Logger.Error(`Client-${this.id}`, "Socket Error", err)
    }


    OnSendTick(ref) {

        for (var q = 0; q < Object.keys(this.sendQueue).length; q++) {

            var method_ = Object.keys(this.sendQueue)[q];
            var queue_ = this.sendQueue[method_];
            if (!queue_.length > 0) {
                continue;
            }

            let sentCount = 0;
            let sendString = "";
            for (let i = 0; i < queue_.length; i++) {
                const _toSend = queue_[i];
                sendString += _toSend + "~";
                queue_.splice(i, 1);
                sentCount++;
            }
            if (Config.verbose) {
                Logger.Info(`Client-${ref.id}`, `OnSendTick`, `Sent "${sendString}" from client ${ref.id}!`);
            }
            ConnectionManager.SendString(sendString, method_, this.sockets[method_])

            if (Config.verbose) {
                Logger.Success(`Client-${ref.id}`, "OnSendTick", `Sent ${sentCount} packets!`);
            }

            this.sentPackets += sentCount;
            TopicList.SetTopic(`clients/${this.id}/packets`,this.sentPackets);
        }

    }

    CheckMethod(method){
        const allMethods = Object.keys(this.connections);
        var newMethod = null;
        if(!method){
            newMethod = allMethods[0];
        }
        
        if (!this.connections[method] ||!this.connections[method].active) {
          
            for(var i=0;i<allMethods.length;i++){
                if(allMethods[i].active){
                    newMethod = allMethods[i];
                }
            }
            Logger.Warning(`Client-${this.id}`, "SendPacket", `Tried to send packet using ${method} but such connection isnt avalible. Using ${newMethod} instead`);
        }else{
            newMethod = method;
        }

        return newMethod;
    }

    SendPacket(msgType, topic, data, method) {
        
        if(!this.CheckMethod(method)){
            Logger.Warning(`Client-${this.id}`, "SendPacket", `No avaible connections to send packet!`);
            return;
        }
        const methodToUse = this.CheckMethod(method);
        var packetString = Util.buildPacket(msgType, topic, data);
        this.sendQueue[methodToUse].push(packetString);

        if (Config.verbose) {
            Logger.Info(`Client-${this.id}`, "SendPacket", `Added packet for ${topic} to queue. Current Queue: ${this.sendQueue[methodToUse].length}`);
        }
    }

    SetTickRate(tickRateRaw) {
        let tickRate = parseInt(tickRateRaw);
        if (tickRate < 1 || tickRate == NaN || !tickRate) {
            Logger.Warning(`Client-${this.id}`, "SetTickRate", "Invalid tickrate provided: " + tickRateRaw)
            this.SendPacket(Consts.types.ERROR, "client_tickrate", ["Non-valid tick rate provided!"]);
            return;
        }
        this.tickRate = tickRate;
        clearInterval(this.tickInterval);
        this.SetTickLoop();
    }

    RecvHeartbeat(timestamp, conType) {
        let connection = this.connections[conType];
        timestamp = parseInt(timestamp);
 
        let ping = new Date().getTime() - timestamp;

        connection.lastActive = timestamp;
        connection.failed = 0;
        connection.ping = ping;

        this.UpdateConnectionInfo(conType);
    }

    CheckHeartbeat(conType){
        let connection = this.connections[conType];

        let lastUpdated = new Date().getTime() - connection.lastActive;
      
        if(lastUpdated > this.timeout){
            connection.failed++;
            Logger.Warning(`Client-${this.id}`, "CheckHeartbeat", conType + " Packet Timeout #" + connection.failed +" (Ping: " + lastUpdated +"ms)");
            if(connection.failed > this.retrys){
                Logger.Warning(`Client-${this.id}`, "CheckHeartbeat", `${conType} Timedout! Killing socket!`);
                this.KillConnection(conType);
            }
        }else{
            connection.failed = 0;
        }

        this.UpdateConnectionInfo(conType);
    }

}

module.exports = Client;