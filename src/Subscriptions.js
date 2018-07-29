const Logger = require('disnode-logger');
const TopicList = require('./Topics/TopicList')
const Config = require('./config')
const Consts = require('./Consts')
var subscriptions = [];

module.exports.AddSub = (client, path) =>{
    subscriptions.push({
        client: client,
        path: path
    });

    Logger.Success("Subscriptions", "AddSub", `${client.id} Subscribed to path ${path}!`)
}

module.exports.OnTopicUpdate = (client, topic) =>{
    
    for (let i = 0; i < subscriptions.length; i++) {
        const _sub = subscriptions[i];
        if(topic.path.startsWith(_sub.path)){
            if(Config.verbose){
                Logger.Info("Subscriptions", "OnTopicUpdate", `${topic.name} updating to client#${client.id}`)
            }
            client.SendPacket(Consts.types.SUBMIT, topic.path, topic.data);
        }
    }
}

