const Logger = require('disnode-logger');
const Config = require("../config");
var topicList = [];

module.exports.AddTopic = (topic) => {
    Logger.Success("TopicManager", "AddTopic", `Added Topic ${topic.name} at path ${topic.path}`)
    topicList.push(topic);
}

module.exports.SetTopic = (path, value, upset = false) => {
    const topic_ = this.GetTopicStrict(path);
    if (topic_.length <= 0 || topic_[0] == {}) {
        Logger.Warning("TopicManager", "SetTopic", `Failed to find topic at ${path}`)
        if(Config.autoGenerateTopics){
            Logger.Info("TopicManager", "SetTopic", `Auto-Generating Topic:  ${path}`)
            module.exports.AddTopic({
                name: path + "-autogen",
                path: path,
                protocol: "TCP"
            });
            module.exports.SetTopic(path,value);
            
            

        }
        return;
    }
    
    topic_[0].SetValue(value);
}

module.exports.GetTopicStrict = (topicPath) => {

    var found = [];

    for (var i = 0; i < topicList.length; i++) {
        if (topicList[i].path == topicPath) {
            found.push(topicList[i]);
        }
    }

    return found;
}

module.exports.GetTopicFuzzy = (topicPath) => {

    //  topicPath.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    var found = [];
    if (topicPath === "*") {
        found = topicList;
        return found;
    }
    const regex = new RegExp(topicPath, 'gi');


    for (var i = 0; i < topicList.length; i++) {

        if (topicList[i].path.startsWith(topicPath)) {
            found.push(topicList[i]);
        }
    }

    return found;
}