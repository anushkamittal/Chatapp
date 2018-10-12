import React ,{Component} from 'react';
import _ from 'lodash';

export default class SearchUser extends Component{

    constructor(props){
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(user){

        if(this.props.onSelect){
            this.props.onSelect(user);
        }
    }

    render(){

        const {store , search} = this.props;
        const Users = store.SearchUsers(search);

        return(
            <div className='search-user'>
            
                <div className='user-list'>
            
                   {Users.map((user,index)=>{

                        return <div key={index} onClick={()=>this.handleClick(user)} className='user'>
                        <img src={_.get(user,'avatar')} alt='...' />
                        <h2>{_.get(user,'name')}</h2>
                        </div>

                   })}

                     
                </div>
            </div>
        )
    }
}