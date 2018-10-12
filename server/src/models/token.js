import Promise from 'promise-polyfill';
import {ObjectID} from "mongodb";
import {OrderedMap} from 'immutable';

export default class Token{

    constructor(app){

        this.app = app;

        this.tokens = new OrderedMap();
    }

    loadTokenAndUser(id = null){

        return new Promise((resolve,reject) =>{

            this.load(id).then((token) =>{

                const userId = token.userId.toString();

                this.app.models.user.load(userId).then((user)=>{

                    token.user = user;
                    return resolve(token);

                }).catch(err =>{

                    return reject(err);
                });
            }).catch(err =>{

                return reject(err);
            })

        });
    }

    load(id = null){

        id = `${id}`;

        return new Promise((resolve,reject)=>{

            //first we check in cache if found need not to query in database

            const tokenInCache = this.tokens.get(id);
            if(tokenInCache){
             
            return resolve(tokenInCache);
            }

            this.findTokenById(id,(err,token)=>{

                if(!err && token){

                    const tokenId = token._id.toString();

                    this.tokens = this.tokens.set(tokenId,token);
                }

                return err? reject(err):resolve(token);
            })
        })


    }

    findTokenById(id , cb = () =>{}){
        
        //console.log("Begin Query in database");
        const objectId = new ObjectID(id);
        const query = {_id : objectId};
        this.app.db.db('chatapp').collection('tokens').findOne(query,(err,result)=>{

            if(err || !result){

                return cb({mesage:"not found"},null);
            }

            return cb(null,result);
        })
    }

    create(userId){

        const token = {
            userId : userId,
            Created: new Date()
        }

        return new Promise((resolve,reject) =>{

            const dbo = this.app.db.db("chatapp");

               dbo.collection('tokens').insertOne(token,(err,info)=>{

                return err ? reject(err):resolve(token)
        })

        })

        
    }
}