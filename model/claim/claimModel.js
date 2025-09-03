const { DataTypes } = require('sequelize');
const sequelize = require('../index');
const { User } = require('../userModel');

const Claim = sequelize.define('Claim', {
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0.01 },
    },
    purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    seller: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
    approvedAt: DataTypes.DATE,
    rejectedAt: DataTypes.DATE,
    rejectReason: DataTypes.TEXT,
}, {
    paranoid: true,
    indexes: [
        { fields: ['status'] },
        { fields: ['userId', 'status'] },
    ],
});

User.hasMany(Claim);
Claim.belongsTo(User, { foreignKey: 'userId' });

module.exports = { Claim, sequelize };