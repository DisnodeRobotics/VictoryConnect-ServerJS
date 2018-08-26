const Logger        = require('disnode-logger');
const Util          = require("./Util");
const Consts        = require("./Consts");
const TopicList     = require("./Topics/TopicList");
const Client        = require("./Clients/Client");
const ClientManager = require("./Clients/ClientManager");
const Topic         = require("./Topics/Topic");
const Config        = require('./config');
const Subscriptions = require('./Subscriptions');
const Command       = require("./Commands");
module.exports.OnMessage = (dataString, socketID, conType) =>{
    let packets = Util.parse(dataString);
    if(packets.length <= 0){
        return;
    }
    for (let i = 0; i < packets.length; i++) {
        const _packet = packets[i];

        _packet.socket = socketID;
        _packet.connection = conType;
        if(Config.verbose) Logger.Info("MessageReciver", "OnMessage", `Parsing packet from ${socketID} on ${conType}`)
        var clientID = ClientManager.GetClientIDBySocketID(socketID, conType);
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
    if(Config.verbose){
        Logger.Info("MessageReciver", "onSubmit", `Trying to topic at ${packet.path} to ${packet.data}`)
    }
    TopicList.SetTopic(packet.path, packet.data);
}

function onRequest(packet){
    const foundTopics = TopicList.GetTopicFuzzy(packet.path);
    var toSend ="";
    for (let i = 0; i < foundTopics.length; i++) {
        const topic = foundTopics[i];
        if(!topic.data){
            topic.data = [];
        }
        ClientManager.GetClient(packet.client).SendPacket(Consts.types.SUBMIT,  topic.path, topic.data, topic.protocol);
    }
}

function onCommand(packet){
    Command.OnCommand(packet);
    
}