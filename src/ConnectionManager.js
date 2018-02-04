var currentConnections = []
var currentDeviceID = 0;

var ConnectionClass = require("./Connection")
var Util = require("./util.js")
exports.newConnection = function (rInfo) {
  var newID = currentDeviceID + 1;
  currentDeviceID++;

  var newConnection = new ConnectionClass({ip: rInfo.address, port: rInfo.port}, newID);
  currentConnections.push(newConnection);
};

exports.onData(msg){
  var data
}

function getConnect(id){
  for(var i=0;i<currentConnections.length; i++){
    if(currentConnections[i].id == id){
      return currentConnections[i];
    }
  }
}
