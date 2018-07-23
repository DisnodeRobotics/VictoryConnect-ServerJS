var currentCache = {};
module.exports.data = currentCache;

module.exports.onData = function(packet){
    if(!packet) {return;}
    if(!packet.topic.length > 0){return;}
    currentCache[packet.topic] = packet.dataString;
}