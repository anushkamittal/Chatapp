import React,{Component} from 'react';
import _ from 'lodash';
import classNames from 'classnames';

export default class Userform extends Component{

    constructor(props){
        super(props);

        this.state = {
            message:null,
            user:{
                email:'',
                password:''
            }
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.onTextFeildChange = this.onTextFeildChange.bind(this);
        this.onClickOutside = this.onClickOutside.bind(this);
    }

    onClickOutside(event){

        if(this.ref && !this.ref.contains(event.target)){

            console.log('You did click outside of login form');

            if(this.props.onClose){
                this.props.onClose();
            }
        }


    }

    componentDidMount(){

        window.addEventListener('mousedown',this.onClickOutside);
    }

    componentWillUnmount(){

        window.removeEventListener('mousedown',this.onClickOutside);
    }


    onSubmit(event){

        const {user} = this.state;
        const {store} = this.props;

        event.preventDefault();

        this.setState({
            message:null,
        },()=>{

            store.login(user.email,user.password).then((user)=>{
                

                this.setState({

                    message:null
                },()=>{

                    if(this.props.onClose){
                        this.props.onClose();
                    }
                });

            }).catch((err)=>{

                console.log('err: ',err);

                this.setState({

                 message:{
                    body:err,
                    type:'error'
                 }  
                })
            })
        })

}

    onTextFeildChange(event){

        const {user} = this.state;

        const name = event.target.name;

        user[name] = event.target.value;

        this.setState({
            user:user
        })

    }

    render(){

        const {user,message} = this.state;

        return(
            <div className='user-form' ref={(ref) => this.ref = ref}>
            
                <form method='post' onSubmit={this.onSubmit}>
                {message? <p className={classNames('app-message',_.get(message,'type'))}> {_.get(message,'body')}</p>: null}
                <div className='form-item'>
                    <label>Email:</label>
                    <input value={_.get(user,'email')} name='email' type='email' placeholder='Email Address...' onChange={this.onTextFeildChange}/>
                </div>

                <div className='form-item'>
                    <label>Password:</label>
                    <input value={_.get(user,'password')} name='password' type='password' placeholder='Password Address...' onChange={this.onTextFeildChange}/>
                </div>

                <div className='form-actions'>
                    <button type='button'>Create An Account?</button>
                    <button type='submit' className='primary'>Sign In</button>
                </div>

                </form>
            </div>
        )
    }
} 