module.exports = {
    verbose: false,
    autoGenerateTopics: true,
    TCP:{
        port: 5000,
        autoRestart: true,
        packetSize: 4096
    },
    UDP:{
        port: 5001,
        autoRestart: true,
        packetSize: 4096
    }
}