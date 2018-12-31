const Logger              = require("disnode-logger");
const ClientManager       = require("./ClientManager");
const ConnectionManager   = require('../Connections/ConnectionManager')
const SubscriptionManager = require("../Subscriptions")
const Topic               = require('../Topics/Topic')
const TopicList           = require('../Topics/TopicList')
const Consts              = require("../Consts")
const Commands            = require("../Commands")
const Util                = require("../Util")
const MessageReciver      = require("../MessageReciver")
const Config              = require("../config")

/*
Client class describes a "Client" on a VCNetwork. A client acts as point of contact on a network, this is usually one 
subsystem such as a Logger or Controller.

A client can have multiple connections assigned to it such as UDP and TCP. This allows each client to use the best
protocol for a given set of data.

A client ID is decided client side, this allows for easy reconnecting and client assiocation. Example of a id would be: 
robot-rio
*/
class Client {
    constructor(id, name) {
        this.connections  = {};    // Stores Connection objects, using connection type as key. (UDP/TCP)
        this.active       = false; // Is the client currently active. (Not being used atm, but could be used to determine if there is an active socket)
        this.id           = id;    // ID of the client, See above
        this.name         = name;  // Name of the client for display purposes
        this.sendQueue    = {};    // Queue of packets to send per connection type. Using connection type as key (UDP/TCP)
        this.tickRate     = 50;    // Tick rate of the client. How many times a secound to send packets/empty the queue
        this.tickInterval = null;  // Var to hold tickrate timer so we can clear/reset it during operation
        this.sentPackets  = 0;     // Total number of sent packet in the client
        this.timeout      = 500;   // How long between packets before we count the connection as timedout.
        this.retrys       = 3;     // How many "timedout" packets before we consider the connection dead.
        this.failed       = 0;     // How many "timedout" packets have we had in a row.

        ClientManager.AddClient(this); // Register the client to the ClientManager, This tracks all active clients

        this.SetTickLoop(); //Start the tick system to send messages in the queue at a fixed rate.


        // Set Client Info for the network. This allows the network to know and view client statuses.
        new Topic({ name: `Client ${this.id} Tick Rate`, path: `clients/${this.id}/tickrate`, protocol: "TCP", data: this.tickRate });
        new Topic({ name: `Client ${this.id} Name`, path: `clients/${this.id}/name`, protocol: "TCP", data: this.name });
        new Topic({ name: `Client ${this.id} Sent Packets`, path: `clients/${this.id}/packets`, protocol: "TCP", data: this.sentPackets });
        new Topic({ name: `Client ${this.id} Timeout`, path: `clients/${this.id}/timeout`, protocol: "TCP", data: this.timeout });
        new Topic({ name: `Client ${this.id} Retrys`, path: `clients/${this.id}/retrys`, protocol: "TCP", data: this.retrys });

        //Print the creation of the client was successful
        Logger.Success(`Client-${this.id}`, "constructor", "New Client Made!")
        
    } //constructor

    AddSocket(connection, socketID) {
        var self = this;
        this.connections[connection] = {
            active: true,
            socket: socketID,
            lastActive: new Date().getTime(),
            ping: 0,
            failed: -2,
            heartbeat: setInterval(()=>{
                self.CheckHeartbeat(connection);
            },self.timeout)
        };
        this.sendQueue[connection] = [];
        Logger.Info(`Client-${this.id}`, "AddSocket", `Adding new socket with type ${connection} and socket id ${socketID}`);

        new Topic({
            name: `Client ${this.id} Connection ${connection} Active`, 
            path: `clients/${this.id}/connections/${connection}/active`, 
            protocol: "TCP", 
            data: "true"
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
        this.SendWelcomePacket(connection);
       
        var self = this;
        
    }
    SendWelcomePacket(conType){
        var self = this;
        self.SendPacket(Consts.types.COMMAND, "server/welcome", [conType, self.timeout, self.retrys]);
        Logger.Info(`Client-${this.id}`, "SendWelcomePacket", "Sending welcome packet");
    }
    UpdateConnectionInfo(conType){
        const connection = this.connections[conType];
        if(!connection){Logger.Error(`Client-${this.id}`, "UpdateConnectionInfo", `Failed to find ${conType} object!`)}
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/active`, connection.active);
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/socket`,connection.socket);
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/lastactive`,connection.lastActive);
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/ping`,connection.ping);
        TopicList.SetTopic(`clients/${this.id}/connections/${conType}/failed`,connection.failed);
    }

    KillConnection(connection) {
        this.connections[connection].active = false;
      
        this.UpdateConnectionInfo(connection);
        SubscriptionManager.RemoveSubs(this.id);
        Commands.RemoveRegisterAll(this.id);
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
                const _toSend = queue_[i].packetString;
                sendString += _toSend + "~";
                queue_.splice(i, 1);
                sentCount++;
            }
            if (Config.verbose) {
                Logger.Info(`Client-${ref.id}`, `OnSendTick`, `Sent "${sendString}" from client ${ref.id}!`);
            }
            ConnectionManager.SendString(sendString, method_, this.connections[method_].socket)

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

        var found = false;
        for(var i=0;i<this.sendQueue[methodToUse].length;i++){
            if(this.sendQueue[methodToUse][i].path == topic){
                found = true;
                this.sendQueue[methodToUse][i].packetString = packetString;
            }
        }
        if(!found){
            this.sendQueue[methodToUse].push({path: topic, packetString: packetString});
        }
     

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

    RecvHeartbeat(timestamp,ping, conType) {
        let connection = this.connections[conType];

        ConnectionManager.SendString(Util.buildPacket(Consts.types.COMMAND, "server/hearbeat_resp", [timestamp,conType]), conType, this.connections[conType].socket)
        connection.lastActive = timestamp;
        connection.failed = 0;
        connection.ping = ping;

        this.UpdateConnectionInfo(conType);

       
    }

    CheckHeartbeat(conType){
        let connection = this.connections[conType];

        let lastUpdated = new Date().getTime() - connection.lastActive;
      
        if(lastUpdated > this.timeout + 50){
           // this.SendWelcomePacket(conType);
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