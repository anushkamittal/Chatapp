import {MongoClient} from 'mongodb';
import Promise from 'promise-polyfill';

//const URL = 'mongodb://anushka3:anushka3@ds137862.mlab.com:37862/chatapp';
const URL ='mongodb://localhost:27017/chatapp';

export default class Database{

    connect(){

        return new Promise((resolve,reject) => {
            
            MongoClient.connect(URL,{ useNewUrlParser: true },(err,db) =>{

                    return err ? reject(err) : resolve(db) ;

            });

        });
    }
}