import Promise from 'promise-polyfill';
import {ObjectID} from "mongodb";
import _ from 'lodash';
import {toString} from '../helper';
import {OrderedMap} from 'immutable';

export default class Channel{

    constructor(app){

        this.app =app;

        this.channels = new OrderedMap();

    }

    create(obj){

        return new Promise((resolve,reject)=>{

            let id = toString(_.get(obj,'_id'));

            let idObject = id ? new ObjectID(id):new ObjectID();

            let members = [];

            _.each(_.get(obj,'members',[]),(value,key)=>{

                console.log("Key",key,value);

                const memberObjId = new ObjectID(key);
                members.push(memberObjId);
            })

            let userObjId = null;
            const userId = _.get(obj,'userId');
            if(userId){
                userObjId = new ObjectID(userId);
            }

            const channel = {

                _id:idObject,
                title:_.get(obj,'title',''),
                lastmessage:_.get(obj,'lastMessage',''),
                created:new Date(),
                userId: userObjId,
                members:members
            }

            this.app.db.db('chatapp').collection('channels').insertOne(channel,(err,info)=>{

                if(!err){
                    
                    const channelId = channel._id.toString();
                    
                    this.channels = this.channels.set(channelId,channel);
                }

                return err ? reject(err):resolve(channel);
            })
        })
    }
}