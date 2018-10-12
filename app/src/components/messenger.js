import React,{Component} from 'react';
import classNames from 'classnames';
import avatar from '../images/avatar.png';
import {OrderedMap} from 'immutable';
import ObjectID from 'bson-objectid';
import {Icon} from 'react-fa';
import _ from 'lodash';
import SearchUser from './search-user';
import moment from 'moment';
import Userbar from './user-bar';

export default class Messenger extends Component{
   constructor(props){
        super(props);

        this.state = {
            height: window.innerHeight,
            newMessage:'',
            SearchUser:'',
            showSearchUser:false
        }

        this._onResize = this._onResize.bind(this);
        
        this.handleset = this.handleset.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.scrollMessagesToBottom = this.scrollMessagesToBottom.bind(this);
        this._createChannel = this._createChannel.bind(this);
        this.renderChannelTitle = this.renderChannelTitle.bind(this);

    }

    

    renderChannelTitle(channel=null){

        if(channel == null){
            return;
        }

        const {store} = this.props;

        const members = store.getMembersFromActiveChannel(channel);

        const names=[];

        members.forEach((user) =>{

            const name = _.get(user,'name');
            names.push(name);
        })

        let title = _.join(names,',');

        if(!title && _.get(channel,'isNew')){
            title = 'New Message';
        }


        return <div><h2>{title}</h2></div>
    }

    _createChannel(){

        const {store} = this.props;

        const currentUser = store.getCurrentUser();
        const currentUserId = _.get(currentUser,'_id'); 

        const channelId = new ObjectID().toString();
        const newChannel={
            _id:channelId,
                title:'',
                lastMessage:'',
                members:new OrderedMap(),
                messages:new OrderedMap(),
                isNew:true,
                created: new Date()
        }

        newChannel.members = newChannel.members.set(currentUserId,true);

        store.onCreateNewChannel(newChannel);
    }

    scrollMessagesToBottom(){

        if(this.messageRef){

            this.messageRef.scrollTop = this.messageRef.scrollHeight ;
        }
    }

    renderMessage(msg){

        const text = _.get(msg, 'body' , '');

        const html =  _.split(text,'\n').map((m,key)=>{
                
            return <p key={key} dangerouslySetInnerHTML= {{__html: m}} />
        })

        return html;
    }

    handleset(){

        const {newMessage} = this.state;
        const {store} = this.props;

        if(_.trim(newMessage).length){

             // create new message
        const messageId = new ObjectID().toString();
        const channel = store.getActiveChannel();
        const channelId = _.get(channel,'_id',null);
        const currentUser = store.getCurrentUser();

        const message = {
            _id: messageId,
            channelId: channelId,
            body: newMessage,
            userId:_.get(currentUser,'_id'),
            me: true,

        }

        store.addMessage(messageId,message);
        this.setState({newMessage:''});

        }

        
    }

    _onResize(){
        this.setState({
            height: window.innerHeight
        });
    }


    componentDidMount(){

        window.addEventListener('resize',this._onResize);
    }

    componentDidUpdate(){
        
        this.scrollMessagesToBottom();
    }


    componentWillUnmount(){
        window.removeEventListener('resize',this._onResize);
    }

    render(){

        const {store} = this.props;

        const activeChannel = store.getActiveChannel();
        const messages = store.getMessagesFromActiveChannel(activeChannel);
        const channels = store.getChannels();
        const members = store.getMembersFromActiveChannel(activeChannel);

        

        var style1 = {
            height:this.state.height
        }


        return(
            <div  className="app-messenger" >
                <div className="header">
                
                    <div className="left">
                    
                        <div className='left-action' ><Icon name="bars" /></div>
                            <div className="actions">
                            Messenger
                            </div>
                        <div className='right-action' onClick={this._createChannel}><Icon name="stack-exchange" /></div>
                    </div>
                    <div className="main-content">
                    
                    {_.get(activeChannel,'isNew')?<div className='toolbar'>

                            {members.map((user,key) => {
                                
                                
                                return <span onClick={
                                    
                                ()=>   { store.removeMemberfromChannel(activeChannel,user) }
                                
                                } key={key}>{_.get(user,'name')}</span>
                            })}

                        <label>To:</label>
                        <input onChange={(event)=>{

                            const searchUserText = _.get(event,'target.value');
                            
                            this.setState({
                                //searchUser:searchUserText,
                                showSearchUser:true
                            },()=>{

                                store.startSearchUser(searchUserText);
                            })

                        }} type='text' value={this.state.searchUser} placeholder='Type person name'/>

                       {this.state.showSearchUser? <SearchUser 
                       
                        onSelect={(user)=>{

                            this.setState({
                                showSearchUser:false,
                                searchUser:''
                            },()=>{

                                const userId = _.get(user,'_id');
                                const channelId = _.get(activeChannel,'_id');

                                store.addUserToChannel(channelId,userId);
                            })
                        }}

                       store={store} search={this.state.searchUser}/>:null}
                    
                    </div>:this.renderChannelTitle(activeChannel)}
                    </div>
                    <div className="right">

                    <Userbar store={store}/>
                     </div>
                </div>
                <div className="main" style={style1}>
                <div className="sidebar-left">
                    <div className='channels' >
                    {channels.map((channel,index) =>{

                        return(
                            <div onClick={(index)=>{
                                
                                store.setActiveChannelId(channel._id);

                            }}key={channel._id} className={classNames('channel',{'active':_.get(activeChannel,'_id') === _.get(channel,'_id',null)})}>
                                <div className='user-image'>
                                    <img src={avatar} alt=" " />
                                </div>
                                <div className='channel-info'>
                                    <h2>{this.renderChannelTitle(channel)}</h2>
                                    <p>{channel.lastMessage}</p>
                                </div>
                            </div>
                            
                        )
                    })}
                    </div>
                </div>
                <div className="main-content">
                        <div ref={(ref) => this.messageRef = ref} className="messages">

                        {messages.map((message,index) =>{

                            const user = _.get(message,'user');

                            return(

                            <div key={index} className={classNames ('message' ,{'me':message.me})}>
                                    <div className='message-user-image'>
                                        <img src={_.get(user,'avatar')} alt=" no profile" />
                                        </div>
                                    <div className='message-body'>
                                                <div className='message-author'>{_.get(user,'name')}</div>
                                                <div className='message-text'>
                                                    {this.renderMessage(message)}
                                                </div>
                                    </div>
                            </div>
                            )

                        })}
                        </div>
                       {activeChannel && members.size>0 ? <div className='message-input'>
                            <div className='text-input'>
                                <textarea onKeyUp={(event)=>{

                                    if(event.key == 'Enter' && !event.shiftKey){
                                        this.handleset();
                                    }
                                }} onChange={(evevt)=>{

                                    this.setState({newMessage: _.get(evevt,'target.value')});

                                }}  value={this.state.newMessage} placeholder='Write text here.....' />
                            </div>
                            <div className='action' onClick={this.handleset}>
                                    <button className="send">send</button>
                            </div>
                        </div>:null}
                </div>
                <div className="sidebar-right">
                
                <div className='members'>
                        
                       {members.size>0? <div>

                           <h2 className='title'>Members</h2>

                        {members.map((member,index)=>{

                            return (

                                <div key={index} className='member'>
                                    <div className='user-image'>
                                        <img src={member.avatar} alt=" " />
                                    </div>
                                    <div className='member-info'>
                                        <h2>{member.name}</h2>
                                        <p>Joined  {moment(member.created).fromNow()}</p>
                                    </div>
                            </div>

                            )
                        })}
                        </div>:null}
                </div>

                </div>
                </div>
            </div> 
        )
    }
};