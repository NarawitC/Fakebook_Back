module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    'Comment',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Title must not empty',
          },
        },
      },
    },
    { underscored: true }
  );
  Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
    });

    Comment.belongsTo(models.Post, {
      foreignKey: {
        name: 'postId',
        allowNull: false,
      },
    });
  };
  return Comment;
};
