exports.parse = function (data) {
  data = data.toString();
  var parts = data.split(" ");
  var subject = parts[0];
  var commandType = parts[1];
  var commandTopic = parts[2];
  var values = parts[3].split(";");

  var parsedValues =values;

  return{
    raw: data,
    subject:  parseInt(subject),
    type: parseInt(commandType),
    topic: commandTopic,
    values: parsedValues
  }

//  logger.Info("VC Server", "", `Packet from ${info.address}:${info.port} \nSubject: ${subject} \nType: ${commandType} \nTopic: ${commandTopic} \nData: ${values}`)
};

exports.buildPacket = function (subject, type, topic, data) {
  return subject + " " + type + " " + topic + " " + data

//  logger.Info("VC Server", "", `Packet from ${info.address}:${info.port} \nSubject: ${subject} \nType: ${commandType} \nTopic: ${commandTopic} \nData: ${values}`)
};
