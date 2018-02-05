var currentConnections = []
var subscriptions = [];
var currentDeviceID = 0;

var ConnectionClass = require("./Connection")
var Util = require("./util.js")
exports.newConnection = function (con) {


  var newID = currentDeviceID + 1;
  currentDeviceID++;

  var newConnection = new ConnectionClass(con, newID);
  currentConnections.push(newConnection);
};

exports.onTopic = function(topic, values){

  var toNotify = [];

  for(var i=0;i<subscriptions.length;i++){
    var currentSub = subscriptions[i];

    if(currentSub.topic == topic || currentSub.topic == "all"){
      toNotify.push(currentSub.id);
    }

  }

  for(var i=0;i<toNotify.length;i++){
    var client = getConnect(toNotify[i]);
    client.writeTopic(topic, values);
  }
}

exports.addSub = function(conID, topic){
  var newSub = {
    id: conID,
    topic: topic
  }

  subscriptions.push(newSub);
}

exports.closeSocket = function(id){
  var connection = getConnect(id);
  connection.connection.destroy();
  delete connection;
}

function getConnect(id){
  for(var i=0;i<currentConnections.length; i++){
    if(currentConnections[i].id == id){
      return currentConnections[i];
    }
  }
}
