import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import WebSocketServer,{Server} from 'ws'; 
import AppRouter from './app-router';
import Model from './models';
import Database from './database';

const PORT = 3001;
const app = express();
app.server = http.createServer(app);


app.use(morgan('dev'));


app.use(cors({
    exposedHeaders: "*"
}));

app.use(bodyParser.json({
    limit: '50mb'
}));

app.wss =new Server({
    server: app.server
});


//connect to database

new Database().connect().then((db) =>{

    console.log('successful connection');

    app.db = db;
}).catch((err) =>{
    throw (err);
});

// new Database().connect((err,db) => {

//     if(err){
//         throw(err);
//     }

//     console.log('Succesfully connected to database with no error');

//     app.db = db;

// });
//end of connection to database

app.models = new Model(app);
app.routers = new AppRouter(app);




/*

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

app.server.listen(process.env.PORT || PORT, () => {
        console.log(`App is running on port ${app.server.address().port}`);
});

export default app;
