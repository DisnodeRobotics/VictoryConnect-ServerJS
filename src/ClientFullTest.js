

var net = require('net');

var HOST = `10.0.0.21`;
var PORT = 5800;
var Util = require("./Util")
var Consts = require("./Consts")
var client = new net.Socket();
var index360 = 0;
var indexFloat = -1.0;
var toggle = false;
function Connect(){
   
    client.connect(PORT, HOST, function() {

        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
     
        client.write("0 0 id {FullTest} ")
    
    
        setInterval(function () {
            index360 += 15;
            if(index360 >= 360){
                index360 = 0;
            }

            indexFloat += 0.25;
            if(indexFloat >= 1.0){
                indexFloat = 0;
            }

            toggle = !toggle;
            SendPackets()
          
        }, 25);
    });
    
}
var index = 0;
function SendPackets(){
    var packets = [
        "0 0 motors " + `{${indexFloat};${indexFloat};${indexFloat};${indexFloat};${indexFloat};${indexFloat};${indexFloat};}`,
        "0 0 navx " + `{connected:);${index360};${indexFloat};${indexFloat};${indexFloat};${toggle};0;}`,
        "0 0 command_intake_lock " + `{running;${toggle}}`,
        "0 0 command_intake_deploy " + `{running;${toggle}}`,
        "0 0 command_intake_wheel " + `{running;${indexFloat}}`
    ]
    index++;
    if(index >= packets.length){
        index = 0;
    }
    client.write(packets[index]);

}

Connect();
// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on("error" , function(err){
  
})
client.on('data', function(data) {
    var packet = Util.parse(data.toString());
    if(packet.topic == "heartbeat" && packet.type == 1){
      client.write("2 0 heartbeat no_data")
    }else{
        console.log('DATA: ' + data);
    }
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});
