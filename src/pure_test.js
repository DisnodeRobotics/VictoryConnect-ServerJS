net = require('net');

// Keep track of the chat clients
var clients = [];

// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort 

console.log("NEW: " + socket.name)

  // Send a nice welcome message and announce
  socket.write("Welcome " + socket.name + "\n");


  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    console.log(data)
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    
  });


}).listen(5800);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");