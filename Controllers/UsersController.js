var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');

module.exports = {
    register : function(req,res){
       var email = req.body.email;
       var username = req.body.username;
       var password = req.body.password;
       var bio = req.body.bio;
       var NOT_EMPTY =/^[a-zA-Z0-9]{5,12}$/;
       var PASSWORD_REGEX = /^(?=.*\d).{4,10}$/;
       var EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
       if( email == null || username == null || password == null){
           return res.status(400).json({'error':'missing parameters'});
       }

       if(!NOT_EMPTY.test(username)){
          return res.status(400).json({'error':'Wrong username (length must be 5-12)'});
       }

       if(!EMAIL_REGEX.test(email)){
           return res.status(400).json({'error':'Email is not valid'});
       }

       if(!PASSWORD_REGEX.test(password)){
          return res.status(400).json({'error':'Passowrd invalid (length must be 4-8 include a number)'});
       }
     
       models.User.findOne({
          attributes : ['email'],
          where :{email:email}
       })
       .then(function(userFound){
           if(!userFound){
               bcrypt.hash(password,5,function(err,bcryptedPassword){
                   if(err) throw err;
                   models.User.create({
                       email:email,
                       username:username,
                       password:bcryptedPassword,
                       bio:bio,
                       isAdmin:0
                   }).then(function(newUser){
                       return res.status(201).json({'userId':newUser.id});
                   })
                   .catch(function(err){
                      return res.status(500).json({'error':'can not add user'});
                   });
               })
           }else {
               return res.status(409).json({'error':'user already exists'});
           }
       })
       .catch(function(error){
            return res.status(500).json({'error':'unable to verify user'});
       });

    },
    login : function(req,res){
        var email = req.body.email;
        var password = req.body.password;

        if(password.length == "" || email.length == ""){
            return res.status(400).json({'error':'missing parameters'});
        }

        models.User.findOne({
           where : {email:email}
        }).then(function(userFound){
          if(userFound){
            bcrypt.compare(password,userFound.password,function(err,match){
                if(match){
                    return res.status(201).json({
                        'userId':userFound.id,
                        'token': jwtUtils.generateTokenForUser(userFound)
                    });
                    
                }else {
                    return res.status(403).json({'error':'Invalid password'});
                }
            })
          }else{
              return res.status(401).json({'error':'User not exist in our database.'});
          }
        })
        .catch(function(error){
            return res.status(500).json({'error':'Unable to verify user'});
        });
    },
    getUserProfile : function(req,res){
        
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if(userId < 0){
            return res.status(400).json({'error':'wrong token'});
        }

        models.User.findOne({
           attributes:['id','email','username','bio'],
           where:{id:userId}
        })
        .then(function(user){
            if(user){
                res.status(201).json(user);
            }else {
                res.status(404).json({'error':'user not found'});
            }
        })
        .catch(function(error){
            res.status(500).json({'error':'can not fetch user '});
        })
    },

    updateUserProfile(req,res){
        var bio = req.body.bio;
        var reqHeader = req.headers['authorization'];
        var userId = jwtUtils.getUserId(reqHeader);
        if(userId < 0){
            return res.status(400).json({'error':'wrong token'});
        }
        
        models.User.findOne({
            attributes :['id','bio'],
            where:{id:userId}
        })
        .then(function(user){
            if(user){
                user.update({
                    bio : bio ? bio : user.bio
                })
                .then(function(){
                    res.status(201).json(user);
                })
                .catch(function(error){
                    res.status(500).json({'error':'can not update user profile'});
                });
            }else{
                res.status(404).json({'error':'User not found'});
            }
        }).catch(function(error){
            res.status(500).json({'error':'can not update user profile'});
        });
       
    }
}