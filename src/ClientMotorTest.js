
const message = "1 0 motors ";

var net = require('net');

var HOST = '127.0.0.1';
var PORT = 5800;
var Util = require("./Util")
var Consts = require("./Consts")
var client = new net.Socket();
var index = 0;
function Connect(){
   
    client.connect(PORT, HOST, function() {

        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
        client.write(message);
        client.write("0 0 id {MotorsMockClient} ")
    
    
        setInterval(function () {
            index += 1;
            if(index >= 360){
                index = 0;
            }
          client.write(message + `{${index};${index};${index};${index};${index};${index};${index};}`);
          
        }, 50);
    });
    
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

    // Close the client socket completely


});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});
