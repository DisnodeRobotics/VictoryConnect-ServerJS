const Logger = require("disnode-logger");
const TCPConnection = require("./Connections/TCPConnection");
const UDPConnection = require("./Connections/UDPConnection")
const Config = require("./config")
const ServerCommands = require('./ServerCommands')
const Client = require('./Clients/Client')

const ConnectionArray = {};
StartConnections();
async function StartConnections(){
    // UDP Startup

    ServerCommands.Bind();

    Logger.Info("Server", "StartConnections", "Starting and Binding TCP Connection");
    TCPConnection.BindOnStart(OnStart);
    TCPConnection.BindOnError(OnError);
    await TCPConnection.Start(Config.TCP);
    ConnectionArray[TCPConnection.type] = TCPConnection;
    Logger.Success("Server", "StartConnections", "TCP Connection Started and Bound!");

    
    Logger.Info("Server", "StartConnections", "Starting and Binding UDP Connection");
    UDPConnection.BindOnStart(OnStart);
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
