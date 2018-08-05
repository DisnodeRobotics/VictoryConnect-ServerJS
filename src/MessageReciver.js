const Logger = require('disnode-logger');
const Util = require("./Util");
const Consts = require("./Consts");
const TopicList = require("./Topics/TopicList")
const Client = require("./Clients/Client")
const ClientManager = require("./Clients/ClientManager")
const Topic = require("./Topics/Topic")
const Config = require('./config')
const Subscriptions = require('./Subscriptions')
module.exports.OnMessage = (dataString, socketID, conType) =>{
    let packets = Util.parse(dataString);
    if(packets.length <= 0){
        return;
    }
    for (let i = 0; i < packets.length; i++) {
        const _packet = packets[i];
        
        _packet.socket = socketID;
        _packet.connection = conType;

       
        let clientID = ClientManager.GetClientIDBySocketID(socketID);
        if(Config.verbose) Logger.Info("MessageReciver", "OnMessage", `Decoded client id (${clientID}) from socket id ${socketID}`)

        _packet.client = clientID;
        if(Config.verbose){
            Logger.Info("MessageReciver", "OnMessage", `Got packet from ${socketID} by ${conType}: ${JSON.stringify(_packet)}`)
        }
        switch(_packet.type){
            case Consts.types.ERROR:
                onError(_packet);
            break;
            case Consts.types.SUBMIT:
                onSubmit(_packet);
            break;
            case Consts.types.REQUEST:
                onRequest(_packet);
            break;
            case Consts.types.COMMAND:
                onCommand(_packet);
            break;
        }
    }   
}

function onError(packet){
    Logger.Warning("MessageReciver", "OnError", "VC Error: " + packet.data)
}

function onSubmit(packet){
    const foundTopics = TopicList.GetTopicStrict(packet.path);
    if(foundTopics.length > 0){
        foundTopics[0].data = packet.data;
        Subscriptions.OnTopicUpdate(packet.client, foundTopics[0])
        if(Config.verbose){
            Logger.Info("MessageReciver", "onSubmit", `Set topic @ ${packet.path} to ${packet.data}`)
        }
    }else{
        if(Config.verbose){
            Logger.Warning("MessageReciver", "onSubmit", `Failed to find any topics @ ${packet.path}`)
        }
    }
}

function onRequest(packet){
    const foundTopics = TopicList.GetTopicFuzzy(packet.path);

    var toSend ="";
    for (let i = 0; i < foundTopics.length; i++) {
        const topic = foundTopics[i];
        if(!topic.data){
            topic.data = [];
        }
        packet.client.SendPacket(Consts.types.SUBMIT,  topic.path, topic.data)
        
    }
}

function onCommand(packet){
    switch(packet.path){

        case "register":
            var clientID = packet.data[0];
            var clientName = packet.data[1];


            Logger.Info("MessageReciever", "onCommand(register)", `Registering new client ${clientID}, ${clientName}`)
            const newClient = new Client(clientID, clientName)
            newClient.AddSocket(packet.connection, packet.socket)
            break;
        case "new_topic":
            let name = packet.data[0];
            let path = packet.data[1];
            let protocol = packet.data[2];
            Logger.Info("MessageReciever", "onCommand(new_topic)", "Creating new topic: " + name + " @ " + path)
            new Topic({name: name, path: path, protocol: protocol});

        break;

        case "subscribe":
            let subPath = packet.data[0];
            Logger.Info("MessageReciever", "onCommand(subscribe)", `Client#${packet.client.id} subscribing to ${subPath}`)
            Subscriptions.AddSub(packet.client, subPath);
        break;

        case "client_tickrate":
            let tickRate = packet.data[0];
            Logger.Info("MessageReciever", "onCommand(client_tickrate)", `Client#${packet.client.id} setting tick rate to ${tickRate}`)
            packet.client.SetTickRate(tickRate);
        break;
    }
}