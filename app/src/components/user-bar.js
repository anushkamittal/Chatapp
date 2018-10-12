import React,{Component} from 'react';
import avatar from '../images/avatar.png';
import _ from 'lodash';
import Userform from './user-form';
import Usermenu from './user-menu';

export default class Userbar extends Component{

    constructor(props){
        super(props);

        this.state = {
            showUserForm:false,
            showUserMenu:false
        }
    }

    render(){

        const {store} = this.props;

        const me = store.getCurrentUser();
        const profilePic = _.get(me , 'avatar');

        return (
            <div className="user-bar" >
                {!me ? <button onClick={() =>{

                        this.setState({
                            showUserForm:true
                        })
                }
                } className='login-btn' type='button'>Sign In</button> : null}
                    <div className="profile-name">{_.get(me,'name')}</div>
                    <div className="profile-image" onClick={()=>{

                            this.setState({
                                showUserMenu:true
                            })
                    }

                    }><img src={profilePic ? profilePic:avatar} alt=" no profile" /></div>
                  {!me && this.state.showUserForm?<Userform 
                    onClose= {() =>{
                        this.setState({
                            showUserForm:false
                        })
                    }}
                  store={store}/>:null}  

                 {this.state.showUserMenu?<Usermenu store={store} onClose={()=>{
                        this.setState({
                            showUserMenu:false
                        })
                    }}/>:null}   

            </div>
        )
    }
}