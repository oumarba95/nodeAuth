var jwt = require('jsonwebtoken');
var SIGN_KEY_SECRET ="kjdhklf5rfmk54fkglgmf8d7dmfjglfd2d32d5f5g";
module.exports = {
    generateTokenForUser : function (userData){
       return jwt.sign({
            userId : userData.id,
            isAdmin:userData.isAdmin
        },SIGN_KEY_SECRET,{
            expiresIn:'1h'
        })
    },
    parseAuthorization: function(authorization){
        return authorization != null ? authorization.replace('Bearer ','') : null;
    },
    getUserId : function(authorization){
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);

        if(token != null){
          try{
            var jwtToken = jwt.verify(token,SIGN_KEY_SECRET);
            if(jwtToken != null){
                userId = jwtToken.userId;
            }
        }catch(err){ }
        }
        return userId;
    }
}