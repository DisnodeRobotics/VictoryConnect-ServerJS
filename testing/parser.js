const Util = require("../src/Util");

var singlePacket = "0 test/topic/1 {this;is;test;data;}"

var parsed1 = Util.parse(singlePacket);

console.log(parsed1);

/// 
var multiPacket = "0 test/topic/1 {this;is;test;data;}~0 test/topic/2 {this;is;test;data;}~0 test/topic/3 {this;is;test;data;}"

var parsed2 = Util.parse(multiPacket);

console.log(parsed2);