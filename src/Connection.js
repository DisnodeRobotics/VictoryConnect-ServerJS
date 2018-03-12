'use strict';
var Util = require("./Util");
var Consts = require("./Consts");
var ConnectionManager = require("./ConnectionManager")
var Cache = require("./Cache")
var Logger = require("disnode-logger");
module.exports = class Connection {
   constructor(connection, id) {
     this.connection = connection;
     this.name = "null_name";
     this.id = id;
     this.ready = false;
     this.heartbeat = {
       recieved: false,
       failed : 0
     }

     this.connection.on("data", (data)=>{this.onData(data);});
     this.connection.on("error", (err)=>{this.onError(err);})
     this.connection.write(Util.buildPacket(id, Consts.types.SUBMIT, "welcome", "no_data"))

     Logger.Success("Connection-" + this.id, "Constructor", "Connection Succesfully Made!")

   }

   onData(data){
     var self = this;
     var parsed = Util.parse(data.toString());
     Cache.onData(parsed);
     switch(parsed.type){
       case Consts.types.SUBMIT:
        self.onSubmitData(parsed);
       break;

       case Consts.types.REQUEST:
       self.onRequestData(parsed);
       break;
     }
   }

   onError(){

   }

   onClose(){

   }


   onSubmitData(packet){
     var self = this;
     switch(packet.topic){
       case "id":
         self.onId(packet);
       break;

       case "heartbeat":
         self.onHeartbeat(packet);
       break;

       case "subscribe":
         self.onSubcribe(packet);
       break;

       default:
          
          ConnectionManager.onTopic(packet.topic, packet.dataString);
        break;
     }
   }



   onId(packet){
     if(this.ready == false){
       this.ready = true;
       this.name = packet.data[0];
       Logger.Success("Connection-" + this.id + ' ' + this.name, "onId", "Connection Succesfully Registered: "  + this.name)
       this.beginHeartbeat();
     }
   }

   onSubcribe(packet){
     ConnectionManager.addSub(this.id, packet.data);
     Logger.Info('Connection-' + this.id + ' ' + this.name, "onId", "Connection subscribed to topic: "  + packet.values)
   }
   beginHeartbeat(){
     var self = this;
    Logger.Info("Connection-" + this.id + ' ' + this.name, "beginHeartbeat", "Beginning Heartbeat. ")
     self.heartbeat.interval = setInterval(()=> {

        self.heartbeatTick();
     }, 500);
   }

   heartbeatTick(){
     if(!this.heartbeat.recieved){
       this.heartbeat.failed++;
       if(this.heartbeat.failed <=1){
         return;
       }
       Logger.Warning("Connection-" + this.id + ' ' + this.name, "heartbeatTick", "Failed Heartbeat Check #" + this.heartbeat.failed + "/10")
       if(this.heartbeat.failed > 10){
         Logger.Error("Connection-" + this.id + ' ' + this.name, "heartbeatTick", "Failed Heartbeat. Disconnecting")
         clearInterval( this.heartbeat.interval)
         this.connection.destroy();

       }
     }else{
       this.heartbeat.failed = 0;
     }

     this.connection.write(Util.buildPacket(this.id, Consts.types.REQUEST, "heartbeat", "no_data"));
     this.heartbeat.recieved = false;
   }


   onHeartbeat(){
     this.heartbeat.recieved = true;
   }


   writeTopic(topic, value){
     this.connection.write(Util.buildPacket(this.id, Consts.types.SUBMIT, topic, value));
   }

}
