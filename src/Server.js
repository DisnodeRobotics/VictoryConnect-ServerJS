const Logger = require("disnode-logger");
const UDPConnection = require("./Connections/UDPConnection");
const Config = require("./config")

const ConnectionArray = {};

async function StartConnections(){

    Logger.Info("Server", "StartConnections", "Starting and Binding UDP Connection");
    UDPConnection.BindOnStart(OnStart);
    UDPConnection.BindOnConnection(OnConnection);
    UDPConnection.BindOnError(OnError);
    UDPConnection.BindOnMessage(OnMessage);
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

}

function OnConnection(connection, newConnnection){

}

function OnMessage(connection, packet){

}
