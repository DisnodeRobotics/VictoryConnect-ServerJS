const net = require('net');

const con = net.createConnection(5000,"localhost");
con.on("connect", ()=>{
    console.log("Connected!");
    reg();
})
con.on("data", (data)=>{
    console.log(data.toString());
})

function reg(){

}