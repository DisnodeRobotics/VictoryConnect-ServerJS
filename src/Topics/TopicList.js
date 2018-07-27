const Logger = require('disnode-logger');

var topicList = [];

module.exports.AddTopic = (topic) => {
    Logger.Success("TopicManager", "AddTopic", `Added Topic ${topic.name} at path ${topic.path}`)
    topicList.push(topic);
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

    const regex = new RegExp(topicPath, 'gi');

    var found = [];

    for (var i = 0; i < topicList.length; i++) {
        
        if (topicList[i].path.startsWith(topicPath)) { 
            found.push(topicList[i]);
        }
    }
    
    return found;
}