import moment from 'moment';
import _ from 'lodash';

export const Start_time = new Date();


export default class AppRouter{

    constructor(app){
        
        this.app = app;

        this.setupRouter = this.setupRouter.bind(this);

        this.setupRouter();
    }

    setupRouter(){

        const app = this.app;

        console.log('App Router works');

        //endpoint:'/'
        //get request

        app.get('/',(req,res,next) =>{
            return res.json({
                started:moment(Start_time).fromNow()
            });
        })

        //endpoint: /api/users
        //post request

        app.post('/api/users',(req,res,next) =>{

            const body = req.body;
             

            app.models.user.create(body).then((user) =>{

                _.unset(user,'password');

                return res.status(200).json(user);

            }).catch((err)=>{

                return res.status(503).json({'error':err});
            });

            
        })

        //endpoint : /api/users/me
        //get request

        app.get('/api/users/me',(req,res,next) =>{

            let tokenId = req.get('authorization');
            
            if(!tokenId){
                //get token from query

                tokenId = _.get(req,'query.auth');
            }

            app.models.token.loadTokenAndUser(tokenId).then((token)=>{

                return res.json(token);

            }).catch(err => {

                return res.status(401).json({
                    error:err
                });
            })
           

        })

        //endpoint: /api/users/search
        //post request

        app.post('/api/users/search',(req,res,next)=>{

            const keyword = _.get(req,'body.search','');

            app.models.user.search(keyword).then((result)=>{

                return res.status(200).json(result);
            }).catch(err => {

                return res.status(401).json({
                    error:"user not found"
                })
            });
        })

        //endpoint: /api/users/:id
        //get request

        app.get('/api/users/:id',(req,res,next)=>{

            const userId = _.get(req,'params.id');

            app.models.user.load(userId).then((user) =>{

                _.unset(user,'password');

                return res.status(200).json(user);

            }).catch((err)=>{

                return res.status(404).json({'error':err});
            });

        })

        


        //endpoint : /api/users/login
        //post request

        app.post('/api/users/login',(req,res,next) =>{

            const body = _.get(req,'body');

            app.models.user.login(body).then((token) =>{

                console.log("successful login");
                _.unset(token,'user.password');
                return res.status(200).json(token);

            }).catch((err) =>{

                return res.status(401).json({'error':err});

            });
        })
    }
}