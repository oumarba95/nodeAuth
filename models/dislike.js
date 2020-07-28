'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dislike = sequelize.define('Dislike', {
    messageId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {});
  Dislike.associate = function(models) {
    // associations can be defined here

    models.Message.belongsToMany(models.User,{
      through:models.Dislike,
      foreignKey:'messageId',
      otherKey:'userId'
    });

    models.User.belongsToMany(models.Message,{
      through:models.Dislike,
      foreignKey:'userId',
      otherKey:'messageId'
    });

    models.Dislike.belongsTo(models.User,{
      foreignKey:'userId',
      as:'user'
    });
    models.Dislike.belongsTo(models.Message,{
      foreignKey:'messageId',
      as:'message'
    });
  };
  return Dislike;
};