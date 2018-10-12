import _ from 'lodash';
import {isEmail} from '../helper';
import Promise from 'promise-polyfill';
import {ObjectID} from 'mongodb';
import bcrypt from 'bcrypt';
import {OrderedMap} from 'immutable';

const saltRounds =10;


export default class User{

    constructor(app){

        this.app = app;
        this.users = new OrderedMap();

    }

    search( q = ""){

        return new Promise((resolve,reject)=>{

            const regex = new RegExp(q,'i');
            const query = {
                $or :[
                    {name : {$regex : regex}},
                    {email: {$regex : regex}}
            ],
            }
    
            this.app.db.db('chatapp').collection('users').find(query,{name:1,email:0}).toArray((err,result)=>{
    
                if(err || !result || !result.length){
    
                    return reject({message: "User not found"});
                }

                return resolve(result);
            })

        })

       
    }

    login(user){

        const email = _.get(user,'email');
        const password = _.get(user,'password');

        return new Promise((resolve,reject)=>{

            if(!email || !password || !isEmail(email)){
                return reject({message:"An Error Login."});
            }

            //now we find user in database
            this.findUserByEmail(email,(err,result) =>{

                if(err){
                    return reject({message:"User not found"});
                }

                //if user found we have to compare password and plain text.

                const hashpassword = _.get(result,'password');
                const isMatch = bcrypt.compareSync(password,hashpassword);

                if(!isMatch){
                    return reject({message:"Login Error"});
                }

                //user successfully found .so now lets create token for user.

                const userId = _.get(result,'_id');
                this.app.models.token.create(userId).then((token)=>{

                    token.user = result;
                    return resolve(token);

                }).catch((err) =>{

                    return reject({message:"Login error"});
                })

                //return resolve(result);
            })

        })
    }

    findUserByEmail(email,callback = () =>{}){

        const dbo = this.app.db.db("chatapp");

        dbo.collection('users').findOne({email:email},(err,result)=>{

            if(err || !result){
                return callback({message:"UserNot Found"});
            }

            return callback(null,result);
        })
    }

    load(id){

        return new Promise((resolve,reject) =>{

            //first check if it is present in cache or not

            const userInCache = this.users.get(id);
            if(userInCache){

                return resolve(userInCache);
            }

            //if not found in cache begin query in database
            this.findUserById(id,(err,user) =>{

                if(!err && user){
                    this.users = this.users.set(id,user);
                }

                return err? reject(err):resolve(user);
            })

        })
    }

    findUserById(id,callback=() =>{}){

       // console.log("Begin Query in Database");

        if(!id){
            return callback({message:"User not found"},null);
        }

        const userId = new ObjectID(id);

        const dbo = this.app.db.db("chatapp");

        dbo.collection('users').findOne({_id:userId},(err,result)=>{

            if(err || !result){
                    return callback({message:"user not found"},null);
            }

            return callback(null,result);
        })

    }

    beforeSave(user, callback = (err,user) =>{}){

        //first validate user before saving to collection.

        let errors = [];
        const fields = ['name','email','password'];
        const validations = {
            name: {
                errorMessage: 'Name is Required',
                do : () => {

                    const name = _.get(user,'name','');

                    return name.length;
                }
            },
            email:{
                errorMessage: 'Email is not correct',
                do : () =>{

                    const email = _.get(user,'email','');

                    if(email.length && isEmail(email)){
                        return true;
                    }
                    return false;
                }
            },
            password:{
                errorMessage: 'Password is required and its length should be more then three characters',
                do : () =>{

                    const password = _.get(user,'password','');

                    if(password.length && password.length>3){
                        return true;
                    }
                    return false;
                }
            }
        }

        //feild validation
        fields.forEach((feild) =>{

            const feildvalidation = _.get(validations,feild);
            

                if(feildvalidation){

                    const isValid = feildvalidation.do();
                    const msg = feildvalidation.errorMessage;

                    if(!isValid){
                        errors.push(msg);
                    }

                }       
            
        })

        if(errors.length){

            const err = _.join(errors,',');
            return callback(err,null);
        }

        const email = _.toLower(_.trim(_.get(user,'email','')));

        const dbo = this.app.db.db("chatapp");

        dbo.collection('users').findOne({email:email},(err,result)=>{

            if(err || result){
                return callback({message:"Email Already Exist"},null);
            }


            //successful return

            const password = _.get(user,'password');
            const hashpassword = bcrypt.hashSync(password,saltRounds);

            const userformatted ={
                name:`${_.trim(_.get(user,'name'))}`,
                email:email,
                password:hashpassword,
                created:new Date()
            }

            return callback(null,userformatted);
        })

    }


    create(user){

        const db = this.app.db;

        console.log('User: ',user);

        return new Promise((resolve,reject) =>{

            this.beforeSave(user, (err, user) =>{

                console.log("After validation: ",err,user);

                if(err){
                    return reject(err);
                }

                const dbo = db.db("chatapp");

                dbo.collection('users').insertOne(user,(err,info) =>{
    
                    //check if error return error to user
                        if(err){
                            return reject({message: "An error saving user"});
                        }

                    //otherwise return user object to user.

                        const userId = _.get(user,'_id').toString(); //this is OBJECTID

                        this.users = this.users.set(userId,user);

                        return resolve(user);
                });

                
            });

             
        });

    
    }
}