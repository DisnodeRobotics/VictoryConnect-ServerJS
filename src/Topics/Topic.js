const Logger = require('disnode-logger');
const Config = require("../config");
class Topic{
    constructor(newTopicInfo){
        this.name = newTopicInfo.name;
        this.path = newTopicInfo.path;
        this.value = null;
        this.lastUpdate = new Date();

        Logger.Success(`Topic-${this.name}`, "constructor", `Created topic with info\n ${JSON.stringify(newTopicInfo, " ", 2)}`);
    }

    GetValue(){
        return this.value;
    }

    SubmitData(newData){
        this.value = newData;
        this.lastUpdate = new Date();
        
        if(Config.verbose){
            Logger.Info(`Topic-${this.name}`, "SubmitData", `Submitting data: ${newData}`);
        }
    }
    
}