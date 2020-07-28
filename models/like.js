'use strict';
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    messageId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {});
  Like.associate = function(models) {
    // associations can be defined here

    models.User.belongsToMany(models.Message,{
      through :models.Like,
      foreignKey: 'userId',
      otherKey:'messageId'
    });

    models.Message.belongsToMany(models.User,{
      through :models.Like,
      foreignKey: 'messageId',
      otherKey:'userId'
    });

    models.Like.belongsTo(models.User,{
       foreignKey:'userId',
       as:'user'
    });

    models.Like.belongsTo(models.Message,{
      foreignKey:'messageId',
      as:'message'
   });
  };
  return Like;
};