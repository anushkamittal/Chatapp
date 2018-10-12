'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _appRouter = require('./app-router');

var _appRouter2 = _interopRequireDefault(_appRouter);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _database = require('./database');

var _database2 = _interopRequireDefault(_database);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = 3001;
var app = (0, _express2.default)();
app.server = _http2.default.createServer(app);

app.use((0, _morgan2.default)('dev'));

app.use((0, _cors2.default)({
    exposedHeaders: "*"
}));

app.use(_bodyParser2.default.json({
    limit: '50mb'
}));

//connect to database

new _database2.default().connect().then(function (db) {

    console.log('successful connection');

    app.db = db;
}).catch(function (err) {
    throw err;
});

// new Database().connect((err,db) => {

//     if(err){
//         throw(err);
//     }

//     console.log('Succesfully connected to database with no error');

//     app.db = db;

// });
//end of connection to database

app.models = new _models2.default(app);
app.routers = new _appRouter2.default(app);

/*

app.wss =new Server({
    server: app.server
});

let clients=[];

app.wss.on('connection',(connection)=>{
    

    const userId = clients.length+1;

    connection.userId = userId;

    const newClient ={
        ws:connection,
        userId: userId,
    };
    
    clients.push(newClient);

    connection.on('message',(message)=>{
        console.log('message from: ',message);
    })

    console.log("New Client Connected with userId: ",userId);

    connection.on('close',()=>{
        console.log('Client with ',userId, 'disconnected');

        clients = clients.filter((client)=> client.userId != userId);
    });
});

*/

app.server.listen(process.env.PORT || PORT, function () {
    console.log('App is running on port ' + app.server.address().port);
});

exports.default = app;
//# sourceMappingURL=index.js.map