'use strict';

var WebSocket = require('ws');

var ws = new WebSocket('ws://localhost:3000');

ws.on('open', function () {
    console.log("Sucessful connection to the server");

    //send message to server
    ws.send('Hello my name is client');

    //listen any message from the server

});

ws.on('error', function (err) {
    return console.log(err);
});
//# sourceMappingURL=client.js.map