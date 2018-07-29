const Logger = require('disnode-logger');
const Config = require("../config");
const TopicList = require("./TopicList")
class Topic{
    constructor(newTopicInfo){
        this.name = newTopicInfo.name;
        this.path = newTopicInfo.path;
        this.data = null;
        this.lastUpdate = new Date();

        Logger.Success(`Topic-${this.name}`, "constructor", `Created topic with info\n ${JSON.stringify(newTopicInfo, " ", 2)}`);
        TopicList.AddTopic(this);
    }

    GetValue(){
        return this.value;
    }

    SubmitData(newData){
        this.data = newData;
        this.lastUpdate = new Date();
        
        if(Config.verbose){
            Logger.Info(`Topic-${this.name}`, "SubmitData", `Submitting data: ${newData}`);
        }
    }
    
}

module.exports = Topic;