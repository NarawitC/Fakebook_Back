const { FRIEND_ACCEPTED, FRIEND_PENDING } = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
  const Friend = sequelize.define(
    'Friend',
    {
      status: {
        type: DataTypes.ENUM(FRIEND_ACCEPTED, FRIEND_PENDING),
        allowNull: false,
        defaultValue: FRIEND_PENDING,
      },
    },
    { underscored: true }
  );
  Friend.associate = (models) => {
    Friend.belongsTo(models.User, {
      as: 'RequestFrom',
      foreignKey: {
        name: 'requestFromId',
        allowNull: false,
      },
    });

    Friend.belongsTo(models.User, {
      as: 'RequestTo',
      foreignKey: {
        name: 'requestToId',
        allowNull: false,
      },
    });
  };
  return Friend;
};
