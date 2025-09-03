const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const ActivationCode = sequelize.define('ActivationCode', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM,
    allowNull: false,
    values: ['enabled', 'disabled'],
    defaultValue: 'enabled',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  usedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  paranoid: true,
});

// Ensure the table exists even if other modules sync earlier
(async () => {
  await sequelize.sync({});
})();

module.exports = {
  ActivationCode,
  sequelize,
};
