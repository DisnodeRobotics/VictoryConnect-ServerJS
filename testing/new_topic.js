const lib = require("./client_lib");
lib.NewTopic("Test Topic 1", "topics/test/1")
lib.SetValue("topics/test/1", ["Test Value!"])
lib.NewTopic("Test Topic 2", "topics/test/2")
lib.SetValue("topics/test/2", ["Test Value 2!"])
lib.GetValue("topics/test/1")
lib.NewTopic("Test Counter", "topics/test/counter")

lib.Subscribe("topics/test", (data)=>{
    console.log("Packet Update: ", data)
});
