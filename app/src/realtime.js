export default class Realtime{

    constructor(store){

        this.store = store;
        this.ws = null;
        this.isConnected = false;

        this.connect();
    }

    send(msg={}){

        const isConnected = this.isConnected;

        if(isConnected){

            const msgString = JSON.stringify(msg);
            this.ws.send(msgString);
        }
    }


    authentication(){
        const store = this.store;

        const tokenId = store.getUserTokenId();

        if(tokenId){

            const message = {
                action:'auth',
                payload:`${tokenId}`
            }
    
            this.send(message);

        }
        
    }

    connect(){

        //console.log("Begin connecting to server via database");

        const ws = new WebSocket("ws://localhost:3001");
        this.ws = ws;

        ws.onopen = () => {

           // console.log("You Are Connected");
           this.isConnected = true;
           this.authentication();

           ws.onmessage = (event) => {

                console.log("Message from the server",event.data);
           }
        }

        ws.onclose = () =>{

           // console.log("Disconnected !!!!");
            this.isConnected = false;
        }

    }
}