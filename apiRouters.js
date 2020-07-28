var express = require('express');
var usersCtr = require('./Controllers/UsersController');
var MessageCtr = require('./Controllers/MessageController');
var LikeCtr = require('./Controllers/LikeController');
exports.router = (function(){
    var apiRouter = express.Router();

    apiRouter.route('/users/register').post(usersCtr.register);
    apiRouter.route('/users/login').post(usersCtr.login);
    apiRouter.route('/users/me/').get(usersCtr.getUserProfile);
    apiRouter.route('/users/me/').put(usersCtr.updateUserProfile);

    apiRouter.route('/messages/new/').post(MessageCtr.postMessage);
    apiRouter.route('/messages/').post(MessageCtr.listMessage);

    apiRouter.route('/messages/:messageId/vote/like').post(LikeCtr.likePost);
    apiRouter.route('/messages/:messageId/vote/dislike').post(LikeCtr.dislikePost);
    return apiRouter;
})();