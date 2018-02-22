var currentCache = {};
module.exports.data = currentCache;

module.exports.onData = function(packet){
    if(!packet.topic.length > 0){return;}
    currentCache.data[packet.topic] = packet.values;
}