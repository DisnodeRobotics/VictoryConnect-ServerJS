const Logger = require('disnode-logger');
const TopicList = require('./Topics/TopicList')
const Config = require('./config')
const Consts = require('./Consts')
const ClientManager = require("./Clients/ClientManager")
var subscriptions = [];

module.exports.AddSub = (client, path) =>{
    subscriptions.push({
        client: client,
        path: path
    });

    Logger.Success("Subscriptions", "AddSub", `${client} Subscribed to path ${path}!`)
}

module.exports.RemoveSubs = (client) =>{
    for (let i = 0; i < subscriptions.length; i++) {
        const _sub = subscriptions[i];
    
        if(_sub.client == client){
            subscriptions.splice(i,1);
        }
    }
}

module.exports.OnTopicUpdate = (topic) =>{
    
    for (let i = 0; i < subscriptions.length; i++) {
        const _sub = subscriptions[i];
        
        if(topic.path.startsWith(_sub.path) || _sub.path == "*"){
            var client = ClientManager.GetClient(_sub.client);
            if(Config.verbose){
                
            }

            if(client){
                client.SendPacket(Consts.types.SUBMIT, topic.path, topic.data, topic.protocol);
            }else{
                Logger.Error("Subscriptions", "OnTopicUpdate", `Cannot find local client ${_sub.client}.`)
            }

        }
    }
}

