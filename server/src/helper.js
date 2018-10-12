export const isEmail = (email) =>{

    const re =/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
}

export const toString = (id) =>{

    const str = "" + `${id}`;

    if(typeof id === 'string'){
        
        return id; 
    }

    return str;
}
