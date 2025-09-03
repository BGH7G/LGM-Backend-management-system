const { DataTypes } = require('sequelize');
const sequelize = require('../index');
const { User } = require('../userModel');

/**
 * Car model representing vehicles available for sale.
 * Follows the same design principles as claimModel.js for consistency.
 */
const Car = sequelize.define('Car', {
    vin: {
        type: DataTypes.STRING(17),
        allowNull: false,
        unique: true,
        validate: {
            len: [11, 17],
        },
    },
    make: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1886, // First automobile year
            max: new Date().getFullYear() + 1,
        },
    },
    color: DataTypes.STRING,
    mileage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0.01,
        },
    },
    status: {
        type: DataTypes.ENUM('available', 'reserved', 'sold'),
        defaultValue: 'available',
    },
    soldAt: DataTypes.DATE,
    description: DataTypes.TEXT,
}, {
    paranoid: true,
    indexes: [
        { fields: ['vin'] },
        { fields: ['status'] },
        { fields: ['userId', 'status'] },
    ],
});

// Associations
User.hasMany(Car, { as: 'CarsForSale' });
Car.belongsTo(User, { foreignKey: 'userId', as: 'Seller' });

module.exports = { Car, sequelize };
