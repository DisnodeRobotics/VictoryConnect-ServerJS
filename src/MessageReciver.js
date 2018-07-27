const Logger = require('disnode-logger');
const Util = require("./Util");
const Consts = require("./Consts");
const TopicList = require("./Topics/TopicList")
const Topic = require("./Topics/Topic")
const Config = require('./config')
module.exports.OnMessage = (dataString, client) =>{
    let packets = Util.parse(dataString);
    if(packets.length <= 0){
        return;
    }
    for (let i = 0; i < packets.length; i++) {
        const _packet = packets[i];
        if(Config.verbose){
            Logger.Info("MessageReciver", "OnMessage", `Got packet from ${client.id}:\n${JSON.stringify(_packet, " ", 2)}`)
        }
        _packet.client = client;
    
        switch(_packet.type){
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

}

function onSubmit(packet){
    const foundTopics = TopicList.GetTopicStrict(packet.path);
    if(foundTopics.length > 0){
        foundTopics[0].value = packet.data;
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
    
        packet.client.SendPacket(Consts.types.SUBMIT,  topic.path, topic.value)
        
    }
}

function onCommand(packet){
    switch(packet.path){
        case "new_topic":
            var name = packet.data[0];
            var path = packet.data[1];
            var protocol = packet.data[2];
            Logger.Info("MessageReciever", "onCommand(new_topic)", "Creating new topic: " + name)
            new Topic({name: name, path: path, protocol: protocol});

        break;
    }
}