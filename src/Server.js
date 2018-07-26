const Logger = require("disnode-logger");
const UDPConnection = require("./Connections/UDPConnection");
const Config = require("./config")

const Client = require('./Clients/Client')

const ConnectionArray = {};
StartConnections();
async function StartConnections(){
    // UDP Startup

    Logger.Info("Server", "StartConnections", "Starting and Binding UDP Connection");
    UDPConnection.BindOnStart(OnStart);
    UDPConnection.BindOnConnection(OnConnection);
    UDPConnection.BindOnError(OnError);
    await UDPConnection.Start(Config.UDP);
    ConnectionArray[UDPConnection.type] = UDPConnection;
    Logger.Success("Server", "StartConnections", "UDP Connection Started and Bound!");
    

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

