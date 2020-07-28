var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
const { response } = require('express');
module.exports = {
    postMessage : function(req,res){
        var reqHeader = req.headers['authorization'];
        var userId = jwtUtils.getUserId(reqHeader);

        var content = req.body.content;
        
        if (content == null || content.length <= 4){
            res.status(403).json({'error':'content incorrect'});
        }
        if(userId < 0){
            return res.status(400).json({'error':'Wrong token.'});
        }
        models.User.findOne({
            where : {id:userId}
        })
        .then(function(userFound){
            if(userFound){
                models.Message.create({
                   content:content,
                   likes : 0,
                   dislike:0,
                   UserId:userFound.id 
                }).then(function(message){
                    if(message){
                        res.status(201).json(message);
                    }else{
                        res.status(500).json({'error':'Unable to post message.'})
                    }
                })
                .catch(function(error){
                    res.status(500).json(error.message)
                })
            }else{
                res.status(404).json({'error':'User not found.'})
            }
        }).catch(function(error){
            res.status(500).json({'error':'can not verify user'});
        })

    },
    listMessage : function(req,res){
        var fields = req.query.fields;
        var offset = parseInt(req.query.offset);
        var limit = parseInt(req.query.limit);

        models.Message.findAll({
            attributes : (fields !=='*' && fields != null) ? fields.split(',') : null,
            limit : (!isNaN(limit)) ? limit : null,
            offset : (!isNaN(offset)) ? offset : null,
            include : [{
              model : models.User,
              attributes :['username']
            }]
        })
        .then(function(messages){
             if(messages){
                 res.status(201).json(messages);
             }else{
                 res.status(404).json({'error':'no messages found'});
             }
        })
        .catch(function(error){
           console.log(error);
           res.status(500).json({'error':'unable to find messages'});
        });
    }
}