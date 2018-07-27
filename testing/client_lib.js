const Utils = require("../src/Util");
const Consts = require("../src/Consts");
const net = require('net')
const UDP = require('net');

const con = net.createConnection(5000,"localhost");


con.on("connect", ()=>{
    console.log("Connected!");
  
})
con.on("data", (data)=>{
    console.log(data.toString());
})


module.exports.SendCommand = (topic, values) =>{
    var packetString = Utils.buildPacket(Consts.types.COMMAND, topic, values);
    con.write(packetString+"~");
}

module.exports.SendRequest = (topic) =>{
    var packetString = Utils.buildPacket(Consts.types.REQUEST, topic, []);
    con.write(packetString+"~");
}
module.exports.SendSubmit = (topic, value) =>{
    var packetString = Utils.buildPacket(Consts.types.SUBMIT, topic, value);
    con.write(packetString+"~");
}

module.exports.NewTopic = (name, path, protocol="UDP")=>{
    this.SendCommand("new_topic", [name, path,protocol])
}

module.exports.SetValue = (path, data)=>{
    this.SendSubmit(path, data)
}

module.exports.GetValue = (path)=>{
    this.SendRequest(path)
}