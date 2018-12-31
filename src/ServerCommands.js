const Logger = require('disnode-logger');
const Util = require("./Util");
const Consts = require("./Consts");
const TopicList = require("./Topics/TopicList");
const Client = require("./Clients/Client");
const ClientManager = require("./Clients/ClientManager");
const Topic = require("./Topics/Topic");
const Config = require('./config');
const Subscriptions = require('./Subscriptions');
const Commands = require('./Commands');

module.exports.Bind = () => {
    Logger.Info("ServerCommands", "Bind", "Binding server commands")
    let self = this;

    Commands.RegisterCommand("server", "server/register", (packet) => {
        let clientID = packet.data[0];
        let clientName = packet.data[1];

        if (ClientManager.GetClient(clientID)) {
            Logger.Success("ServerCommands", "server/register", `Found existing ${clientID}, ${clientName}. Adding socket`)
            ClientManager.GetClient(clientID).AddSocket(packet.connection, packet.socket);
        } else {
            Logger.Success("ServerCommands", "server/register", `Registering new client ${clientID}, ${clientName}`)
            const newClient = new Client(clientID, clientName)
            newClient.AddSocket(packet.connection, packet.socket)
        }
    });

    Commands.RegisterCommand("server", "server/new_topic", (packet) => {
        let name = packet.data[0];
        let path = packet.data[1];
        let protocol = packet.data[2];
        Logger.Info("ServerCommands", "server/new_topic", "Creating new topic: " + name + " @ " + path)
        new Topic({ name: name, path: path, protocol: protocol });
    });

    Commands.RegisterCommand("server", "server/subscribe", (packet) => {
        let subPath = packet.data[0];
        Logger.Info("ServerCommands", "server/subscribe", `Client#${packet.client.id} subscribing to ${subPath}`)
        Subscriptions.AddSub(packet.client, subPath);
    });

    Commands.RegisterCommand("server", "server/heartbeat", (packet) => {
        let timestamp = packet.data[0];
        let ping      = packet.data[1];
        if (ClientManager.GetClient(packet.client)) {
            ClientManager.GetClient(packet.client).RecvHeartbeat(timestamp,ping, packet.connection);
        }
    });

    Commands.RegisterCommand("server", "server/tickrate", (packet) => {
        let tickRate = packet.data[0];
        Logger.Info("MessageReciever", "server/tickrate", `Client#${packet.client.id} setting tick rate to ${tickRate}`);
        if (ClientManager.GetClient(packet.client)) {
            ClientManager.GetClient(packet.client).SetTickRate(tickRate);
        }
        
      
    });

    Commands.RegisterCommand("server", "server/command", (packet) => {
        let commandToSub = packet.data[0];
        Logger.Info("MessageReciever", "server/command", `Client#${packet.client.id} registering command ${commandToSub}`);
        Commands.RegisterCommand(packet.client, commandToSub);

       
    });

}

