var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLibs = require('async');
const { json } = require('sequelize');
const message = require('../models/message');

module.exports = {
    likePost : function (req,res){
        var reqHeader = req.headers['authorization'];
        var userId = jwtUtils.getUserId(reqHeader);
        var messageId = parseInt(req.params.messageId);
        
        if(messageId <=0 ){
            return res.status(400).json({'error':'invalid parameters'});
        }
  
        asyncLibs.waterfall([
            function(done) {
              models.Message.findOne({
                where: { id: messageId }
              })
              .then(function(messageFound) {
                done(null, messageFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify message' });
              });
            },
            function(messageFound, done) {
              if(messageFound) {
                models.User.findOne({
                  where: { id: userId }
                })
                .then(function(userFound) {
                  done(null, messageFound, userFound);
                })
                .catch(function(err) {
                  return res.status(500).json({ 'error': 'unable to verify user' });
                });
              } else {
                res.status(404).json({ 'error': 'post already liked' });
              }
            },
            function(messageFound, userFound, done) {
              if(userFound) {
                models.Like.findOne({
                  where: {
                    userId: userId,
                    messageId: messageId
                  }
                })
                .then(function(userAlreadyLikedFound) {
                  done(null, messageFound, userFound, userAlreadyLikedFound);
                })
                .catch(function(err) {
                  return res.status(500).json(err.message);
                });
              } else {
                res.status(404).json({ 'error': 'user not exist' });
              }
            },
            function(messageFound, userFound, userAlreadyLikedFound, done) {
              if(!userAlreadyLikedFound) {
                 models.Dislike.findOne({
                   userId:userFound.id,
                   messageId:messageFound.id
                 }).then(function(dislike){
                   if(dislike){
                     dislike.destroy()
                     .then(function(){
                       messageFound.update({
                         dislike:messageFound.dislike - 1
                       }).then(function(){
                        models.Like.create({
                          userId:userFound.id,
                          messageId:messageFound.id
                        })
                        .then(function (alreadyLikeFound) {
                              messageFound.update({
                                likes:messageFound.likes + 1
                              }).then(function(messageFound){
                                return res.status(201).json(messageFound);
                              })
                        })
                        .catch(function(err) {
                          return res.status(500).json({ 'error': 'unable to set user reaction' });
                        });
                       })
                     })
                   }else{
                    models.Like.create({
                      userId:userFound.id,
                      messageId:messageFound.id
                    })
                    .then(function (alreadyLikeFound) {
                      done(null, messageFound, userFound);
                    })
                    .catch(function(err) {
                      return res.status(500).json({ 'error': 'unable to set user reaction' });
                    });
                   }
                 })

              } else {
                  
                    userAlreadyLikedFound.destroy()
                    .then(function(){
                       messageFound.update({
                         likes : messageFound.likes - 1
                       })
                       return res.status(201).json(messageFound);
                    })           
     
              }
            },
            function(messageFound, userFound, done) {
              messageFound.update({
                likes: messageFound.likes + 1,
              }).then(function() {
                done(messageFound);
              }).catch(function(err) {
                res.status(500).json({ 'error': 'cannot update message like counter' });
              });
            },
          ], function(messageFound) {
            if (messageFound) {
              return res.status(201).json(messageFound);
            } else {
              return res.status(500).json({ 'error': 'cannot update message' });
            }
          });
        },
    dislikePost : function(req,res){

        var reqHeader = req.headers['authorization'];
        var userId = jwtUtils.getUserId(reqHeader);
        var messageId = req.params.messageId;
        if (userId <= 0){
            return res.status(403).json({'error':'wrong token.'});
        }
        
        if ( messageId <= 0){
            return res.status(403).json({'error':'invalid parameter'});
        }
        
        asyncLibs.waterfall([
          function(done){
              models.Message.findOne({
                  where : {id:messageId}
              }).then(function(messageFound){
                 done(null,messageFound);
              }).catch(function(error){
                 return res.status(500).json({'error':'unable to verify message'})
              });
          },function(messageFound,done){
              if(messageFound){
                  models.User.findOne({
                     where : {id:userId} 
                  }).then(function(userFound){
                      done(null,messageFound,userFound);
                  }).catch(function(error){
                      return res.status(500).json({'error':'unable to verify user'});
                  })
              }else{
                  return res.status(404).json({'error':'Message not exist'});
              }
          },function(messageFound,userFound,done){
              if(userFound){
                   models.Like.findOne({
                       where : {
                           messageId : messageId,
                           userId : userId
                       }
                   }).then(function(likeByUserFound){
                       done(null,messageFound,userFound,likeByUserFound);
                   }).catch(function(error){
                       return res.status(500).json(error.message);
                   })
              }else{
                res.status(404).json({'error':'user not exist'});
              }
          },function(messageFound,userFound,likeByUserFound,done){
              if(likeByUserFound){
                  likeByUserFound.destroy()
                  .then(function(){
                      done(null,messageFound,userFound);
                  }).catch(function(error){
                      return res.status(500).json({'error':'cannot remove already like to post'});
                  });
              }else{
                 models.Dislike.findOne({
                   userId: userFound.id,
                   messageId:messageFound.id
                 }).then(function(dislike){
                      if(dislike){
                          dislike.destroy();
                          messageFound.update({
                            dislike: messageFound.dislike - 1
                          }).then(function(dislike){
                             return res.status(201).json({'success':'dislike removed'});
                          }).catch(function(error){
                             return res.status(500).json(error.message);
                          })
                      }else{
                        models.Dislike.create({
                          messageId:messageFound.id,
                          userId:userFound.id
                        }).then(function(dislike){
                           if(dislike){
                             messageFound.update({
                               dislike: messageFound.dislike + 1
                             }).then(function(messageUpdated){
                                  if(messageUpdated)
                                     return res.status(201).json(dislike);
                             }).catch(function(error){
                                return res.status(500).json({'error':'can not update dislike counter'})
                             });
                                 
                          }
                        }).catch(function(error){
                         return res.status(500).json({'error':'cannot set user reactio'});
                        });
                      }
                 }).catch(function(error){
                    return res.status(500).json({'error':'can not verify user passed reaction'});
                 })

              }
          },function(messageFound,userFound,done){
              messageFound.update({
                likes : messageFound.likes - 1
              }).then(function(messageUpdated){
                  done(null,messageUpdated,userFound);
              }).catch(function(error){
                  return res.status(500).json(error.message);
              });
          },function(messageUpdated,userFound,done){
              if(messageUpdated){
                   models.Dislike.create({
                     messageId:messageUpdated.id,
                     userId:userFound.id
                   }).then(function(dislike){
                     done(null,dislike,messageUpdated);
                   }).catch(function(error){
                      return res.status(500).json(error.message)
                   });
              }else{
                 return res.status(500).json({'error':'cannot update message '});
              }
          },function(dislike,messageUpdated){
            if(dislike){
              messageUpdated.update({
                 dislike: messageUpdated.dislike + 1
              })
              return res.status(201).json(dislike);
            }else{
              return res.status(500).json({'error':'unable to set user dislike'});
            }
          }
        ]);
    }
}