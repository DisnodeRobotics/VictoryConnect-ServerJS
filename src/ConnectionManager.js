var currentConnections = []
var subscriptions = [];
var currentDeviceID = 0;
  
var ConnectionClass = require("./Connection")
var Cache = require("./Cache.js");
var Util = require("./Util.js")
exports.newConnection = function (con) {


  var newID = currentDeviceID + 1;
  currentDeviceID++;

  var newConnection = new ConnectionClass(con, newID);
  currentConnections.push(newConnection);
};

exports.onTopic = function(topic, dataString){

  var toNotify = getSubsForTopic(topic);

  

  if(toNotify){
    for(var i=0;i<toNotify.length;i++){
      var client = getConnect(toNotify[i]);
      client.writeTopic(topic, dataString);
    }
  }
}

exports.addSub = function(conID, topic){
  var newSub = {
    id: conID,
    topic: topic
  }
  if(checkForSub(conID, topic))
  {
    return;
  }

  subscriptions.push(newSub);
  if(Cache.data[topic]){
    var client = getConnect(conID);
    client.writeTopic(topic, Cache.data[topic]);
  }
}

exports.closeSocket = function(id){
  var connection = getConnect(id);
  connection.connection.destroy();
  delete connection;
}

function checkForSub(id, topic){
  var subForTopic = getSubsForTopic(topic);
  var subbed = false;
  if(subForTopic){
    for(var i=0;i>subForTopic.length;i++){
      if(subForTopic[i].id == id){
        subbed = true;
      }
    }
  }
  return subbed;
}

function getSubsForTopic(topic){
  var toNotify = [];
  for(var i=0;i<subscriptions.length;i++){
    var currentSub = subscriptions[i];

    if(currentSub.topic == topic || currentSub.topic == "all"){
      toNotify.push(currentSub.id);
    }

  }
  return toNotify;
}
function getConnect(id){
  for(var i=0;i<currentConnections.length; i++){
    if(currentConnections[i].id == id){
      return currentConnections[i];
    }
  }
}
