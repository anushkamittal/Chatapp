'use strict';

var WebSocket = require('ws');

var ws = new WebSocket('ws://localhost:3000');

ws.on('open', function () {
    console.log("Sucessful connection to client2 the server");

    //send message to server
    ws.send('Hello my name is client 2');

    //listen any message from the server
    ws.on('message', function (message) {

        console.log(message);
    });
});

ws.on('error', function (err) {
    return console.log(err);
});
//# sourceMappingURL=client2.js.map