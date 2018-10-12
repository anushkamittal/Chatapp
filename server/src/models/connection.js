import {OrderedMap} from 'immutable';
import {ObjectID} from 'mongodb';
import _ from 'lodash';

export default class Connection{

    constructor(app){

        this.app = app;

        this.connection = new OrderedMap();

        this.modelDidLoad();
    }

    decodemessage(message){

        let messageObj = null;

        try{

            messageObj = JSON.parse(message);
        }catch(err){

            console.log("An error decode the socket message",message);
        }

        return messageObj;
    }

    send(ws,obj){

        const message = JSON.stringify(obj);
        ws.send(message);
    }

    doTheJob(socketId,msg){

        const action = _.get(msg,'action');
        const payload = _.get(msg,'payload');
        const connection = this.connection.get(socketId);
        const userconnection = this.connection.get(socketId);
        
        let channel = payload; 
        

        switch(action){

            case 'create_channel':

                    channel.userId = userconnection.userId;

                    this.app.models.channel.create(channel).then((channelobj)=>{

                        console.log("Successfully created new channel",typeof userconnection.userId,channelobj);

                        let memConnections = [];

                        _.each(_.get(channelobj,'members',[]),(id)=>{

                            const userId = id.toString();
                            const memConnection = this.connection.filter((con)=> `${con.userId}`== userId);

                            if(memConnection.size){

                                memConnection.forEach(con => {
                                    
                                    const ws = con.ws;
                                    const obj = {
                                        action:'channel_added',
                                        payload:channelobj
                                    }

                                    this.send(ws,obj);
                                });
                                console.log(memConnection);
                            }
                        })

                    })

                    console.log("User has created new channel",payload);
                    break;

            case "auth":

            if(connection){

                this.app.models.token.loadTokenAndUser(payload).then((token)=>{

                    connection.isAuthenticated = true;
                    connection.userId = `${token.userId}`;

                    this.connection = this.connection.set(socketId,connection);

                    const obj ={
                        action:'auth_success',
                        payload:"You are verified"
                    }

                    this.send(connection.ws,obj);


                }).catch((err)=>{

                    const obj ={
                    action:'auth_error',
                    payload:"An error has occured during account authentication"+payload
                }

                this.send(connection.ws,obj);

                })
                
            }
                console.log("User With id ",payload,typeof payload);
                break;

            default:

                break;
        }
    }

    modelDidLoad(){

        this.app.wss.on('connection', (ws) =>{

            const socketId = new ObjectID().toString(); 

            const clientConnection = {
                _id :`${socketId}`,
                ws : ws,
                userId:null,
                isAuthenticated:false
            }

            this.connection = this.connection.set(socketId,clientConnection);

            


            //console.log("someone is connected",socketId);

            //listen message from server
            ws.on('message',(msg)=>{

               const msgObject = this.decodemessage(msg);
               this.doTheJob(socketId,msgObject);

                //console.log("Listening message from server",msgObject);
            })

            ws.on('close',()=>{

              //  console.log("Someone is disconnected",socketId);
            })

        });
    }
}