import {OrderedMap} from 'immutable';
import _ from 'lodash';
import Service from './service';
import Realtime from './realtime';

export default class store {
    constructor(appComponent){

        this.app = appComponent;

        this.token = this.getTokenFromLocalstorage();

        this.services = new Service();
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;

       this.user= this.getUserFromLocalStorage();
       this.users = new OrderedMap();

       this.search = {
           users: new OrderedMap()
       }

       this.realtime = new Realtime(this);
    }

    getUserTokenId(){

        return _.get(this.token,'_id',null);
    }

    loadUserAvatar(user){

        return `https://ui-avatars.com/api/?name=${user.name}`;
    }

    startSearchUser(q=""){

        //connecting to backened
        const data = {search:q};

        this.search.users = this.search.users.clear();

        this.services.post('api/users/search',data).then((res) =>{

            const users = _.get(res,'data',[]);

            _.each(users, (user)=>{

                user.avatar = this.loadUserAvatar(user);
                const userId = `${user._id}`;
                
                this.users = this.users.set(userId,user);
                this.search.users = this.search.users.set(userId,user);

            })

            //update
            this.update();
        }).catch((err)=>{

            console.log("searching error",err);
        })

    }

    setUserToken(accessToken){

        if(!accessToken){

            localStorage.removeItem('token');
            this.token = null;
        }

        localStorage.setItem('token',JSON.stringify(accessToken));
        this.token = accessToken;
    }

    getTokenFromLocalstorage(){

        let token = null;

        const data = localStorage.getItem('token');
        if(data){

            try{

                token = JSON.parse(data);
            }
            catch(err){

                console.log(err);
            }
        }

        return token;
    }

    getUserFromLocalStorage(){

        let user = null;
        const data = JSON.parse(localStorage.getItem('me'));

        try{

            user = data;

        }catch(err){

            console.log(err);

        }

        if(user){

            //try to connect to backened
            const token = this.getTokenFromLocalstorage();
            const tokenId = _.get(token,'_id');

            const options = {
                headers:{
                    authorization:tokenId,
                }
            }

            this.services.get('api/users/me',options).then((res)=>{

                const accessToken = res.data;
                const user = _.get(accessToken,'user');

                this.setCurrentUser(user);
                this.setUserToken(accessToken);
            }).catch(err=>{

                this.signOut();
            })
        }

        return user;
    }

    setCurrentUser(user){

        user.avatar = this.loadUserAvatar(user);

        this.user = user;

        if(user){
            localStorage.setItem('me',JSON.stringify(user));

            const userId = `${user._id}`;
            this.users = this.users.set(userId,user);
        }

        this.update();
    }

    signOut(){

        const userId = _.get(this.user , '_id',null);

        this.user = null;
        localStorage.removeItem('me');
        localStorage.removeItem('token');

        if(userId){
            this.users = this.users.remove(userId);
        }

        this.update();
    }

    login(email = null,password = null){

        const userEmail = _.toLower(email);

        const user = {
            email: userEmail,
            password: password
        }

        console.log("Trying to login with info",user);
        
        return new Promise((resolve,reject) =>{

           //we call to backened service and login with user details

           this.services.post('api/users/login',user).then((response) =>{

            //sucessful login
            const accessToken = _.get(response, 'data');
            const user = _.get(accessToken,'user');

            this.setCurrentUser(user);
            this.setUserToken(accessToken);

            console.log("got user login callback from server", accessToken);

           }).catch((err) =>{

            console.log("Got an error login from server",err);

                const message = _.get(err,'response.data.error.message',"Login error");

                return reject(message);
           })

            // const user = users.find((item) => item.email === userEmail);
            // _this.setCurrentUser(user);

            // return user ? resolve(user) : reject('User not found');

        });

        
    }

    removeMemberfromChannel(channel=null , user = null){

        if(!channel && !user){
            return;
        }

        const channelId = _.get(channel,'_id');
        const userId = _.get(user,'_id');

        channel.members = channel.members.remove(userId);

        this.channels = this.channels.set(channelId,channel);
        this.update();

    }

    addUserToChannel(channelId,userId){

        const channel = this.channels.get(channelId);

        if(channel){

            //now add this memberid to members

            channel.members = channel.members.set(userId,true);
            this.channels = this.channels.set(channelId,channel);
            this.update();
        }
    }

    SearchUsers(search=''){

        // let searchItem = new OrderedMap();

        // const keyword = _.toLower(search);
        // const currentUser = this.getCurrentUser();
        // const currentUserId = _.get(currentUser,'_id');

        // if(_.trim(search).length){

        //     // do search in our users list

        //     users.filter((user) => {

        //         const name =  _.toLower( _.get(user,'name'));
        //         const userId = _.get(user,'_id');

        //         if(_.includes(name,keyword) && _.get(user,'_id') !== currentUserId){

        //             searchItem = searchItem.set(userId, user);
        //         }
        //     })
        // }

        return this.search.users.valueSeq();
    }

    onCreateNewChannel(channel = {}){

        const channelId = _.get(channel,'_id');

        this.addChannel(channelId,channel);
        this.setActiveChannelId(channelId);

        
    }

    getCurrentUser(){
        return this.user;
    }

    setActiveChannelId(id){
        this.activeChannelId = id;
        this.update();
    }

    getActiveChannel(){

        const channel = this.activeChannelId ? this.channels.get(this.activeChannelId):this.channels.first();
        return channel;
    }

    addMessage(id,message = {}){


        //we need to add current user
        const user = this.getCurrentUser();
        message.user = user;

        this.messages = this.messages.set(`${id}`,message);

        //let's add new message id to current channel-messages,

        const channelId = _.get(message,'channelId');
        if(channelId){

            const channel = this.channels.get(channelId);

            channel.isNew = false;
            channel.lastMessage = _.get(message,'body','');

            //now send this channel info to server
            const obj = {
                action:'create_channel',
                payload:channel
            }

            this.realtime.send(obj);

            console.log("channel",channel);

            channel.messages = channel.messages.set(id, true);
            this.channels = this.channels.set(channelId, channel);
        }

        this.update();
    }
    getMessages(){

        return this.messages.valueSeq();
    }

    getMessagesFromActiveChannel(channel){

        let messages = new OrderedMap();
        
        if(channel){
             channel.messages.map((value,key) =>{

                const message = this.messages.get(key);
                 
                messages = messages.set(key,message);

             });
        }
        return messages.valueSeq();
    }

    getMembersFromActiveChannel(channel){

        let members =new OrderedMap();

        if(channel){
            channel.members.forEach((value,key) =>{
                

                const userId = `${key}`;
                const member = this.users.get(userId);
                const loggedUser = this.getCurrentUser();

                if(_.get(loggedUser,'_id') !== _.get(member,'_id')){
                    members = members.set(key,member);
                }
                

            });
        }
        return members.valueSeq();
    }

    addChannel(index,channel={}){
        this.channels = this.channels.set(`${index}`,channel);
        this.update();
    }
    getChannels(){

        //we need to sort channel by date, last one comes on top
        this.channels = this.channels.sort((a,b) => a.created < b.created);

        return this.channels.valueSeq();
    }
    update(){
        this.app.forceUpdate();
    }
}