const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open',()=>{
    console.log("Sucessful connection to client2 the server");

    //send message to server
    ws.send('Hello my name is client 2');

    //listen any message from the server
    ws.on('message',(message) => {
        
        console.log(message);
    })
    
});



ws.on('error', (err) => console.log(err));