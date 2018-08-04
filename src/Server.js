const Logger = require("disnode-logger");
const TCPConnection = require("./Connections/TCPConnection");
const Config = require("./config")

const Client = require('./Clients/Client')

const ConnectionArray = {};
StartConnections();
async function StartConnections(){
    // UDP Startup

    Logger.Info("Server", "StartConnections", "Starting and Binding TCP Connection");
    TCPConnection.BindOnStart(OnStart);
    TCPConnection.BindOnConnection(OnConnection);
    TCPConnection.BindOnError(OnError);
    await TCPConnection.Start(Config.TCP);
    ConnectionArray[TCPConnection.type] = TCPConnection;
    Logger.Success("Server", "StartConnections", "TCP Connection Started and Bound!");
    

}

// -- Binds -- //
//Generic
function OnStart(connection){
    Logger.Info("Server", "OnStart", `Connection ${connection.name} started!`);
    
}

function OnError(connection, error){
    Logger.Error("Server", `${connection.name} Error`, error)
}

function OnConnection(connection, newSocket){
    new Client(connection, newSocket)
}
