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
      failed: 0
    }

    this.connection.on("data", (data) => { this.onData(data); });
    this.connection.on("error", (err) => { this.onError(err); })
    this.tickRate = 60;
    this.toSend = [];

    this.startToSend();
    this.connection.setTimeout(1000);
    this.connection.write(Util.buildPacket(id, Consts.types.SUBMIT, "welcome", "no_data"))

    Logger.Success("Connection-" + this.id, "Constructor", "Connection Succesfully Made!")

   



  }

  startToSend(){
        
    var self = this;
    if(this.toSendLoop){
      clearInterval(this.toSendLoop);
    }
    this.toSendLoop = setInterval(()=>{self.toSendTick()}, 1000/this.tickRate);
      
  }

  toSendTick(){
    for(var i=0;i<this.toSend.length;i++){
      var cur = this.toSend[i];
      this.connection.write(Util.buildPacket(this.id, Consts.types.SUBMIT, cur.topic, cur.value));
      this.toSend.splice(i,1);
    }
  }

  onData(data) {
    var self = this;
    var parsed = Util.parse(data.toString());
    Cache.onData(parsed);
    switch (parsed.type) {
      case Consts.types.SUBMIT:
        self.onSubmitData(parsed);
        break;

      case Consts.types.REQUEST:
        self.onRequestData(parsed);
        break;
    }
  }

  onError() {

  }

  onClose() {

  }


  onSubmitData(packet) {
    var self = this;
    switch (packet.topic) {
      case "id":
        self.onId(packet);
        break;

      case "heartbeat":
        self.onHeartbeat(packet);
        break;

      case "subscribe":
        console.log(packet);
        self.onSubcribe(packet);
        break;

      default:

        ConnectionManager.onTopic(packet.topic, packet.dataString);
        break;
    }
  }



  onId(packet) {
    if (this.ready == false) {
      this.ready = true;
      this.name = packet.data[0];
      if(packet.data[1]){
        this.tickRate = parseInt(packet.data[1]);
        Logger.Info("Connection-" + this.id + ' ' + this.name, "onId", "Setting Tick Rate: " + this.tickRate)
        this.startToSend();
      }
      Logger.Success("Connection-" + this.id + ' ' + this.name, "onId", "Connection Succesfully Registered: " + this.name)
      this.beginHeartbeat();
    }
  }

  onSubcribe(packet) {
    ConnectionManager.addSub(this.id, packet.data[0]);
    Logger.Info('Connection-' + this.id + ' ' + this.name, "onId", "Connection subscribed to topic: " + packet.data[0])
  }
  beginHeartbeat() {
    var self = this;
    var tick = 500;
    if (this.name == "VictoryDash") {
      tick = 1000;
    }
    Logger.Info("Connection-" + this.id + ' ' + this.name, "beginHeartbeat", "Beginning Heartbeat. ")
    self.heartbeat.interval = setInterval(() => {

      self.heartbeatTick();
    }, tick);
  }

  heartbeatTick() {
    if (!this.heartbeat.recieved) {
      this.heartbeat.failed++;
      if (this.heartbeat.failed <= 1) {
        return;
      }
      Logger.Warning("Connection-" + this.id + ' ' + this.name, "heartbeatTick", "Failed Heartbeat Check #" + this.heartbeat.failed + "/10")
      if (this.heartbeat.failed > 10) {
        Logger.Error("Connection-" + this.id + ' ' + this.name, "heartbeatTick", "Failed Heartbeat. Disconnecting")
        clearInterval(this.heartbeat.interval)
        this.connection.destroy();

      }
    } else {
      this.heartbeat.failed = 0;
    }

    this.connection.write(Util.buildPacket(this.id, Consts.types.REQUEST, "heartbeat", "no_data"));
    this.heartbeat.recieved = false;
  }


  onHeartbeat() {
    this.heartbeat.recieved = true;
  }


  writeTopic(topic, value) {
    var packetAlreadyAdded = false;
    for(var i=0;i<this.toSend.length;i++){
      if(this.toSend[i].topic == topic){
        packetAlreadyAdded = true;
        this.toSend[i] = {topic: topic, value:value};
      }
    }
    if(packetAlreadyAdded){
      return;
    }

    this.toSend.push({topic: topic, value:value});
  }

}
