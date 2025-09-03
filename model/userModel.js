const {DataTypes} = require('sequelize');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const sequelize = require('./index');
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 30],
        }
    },
    avatar: {
        type: DataTypes.TEXT,
    },
    role: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['admin', 'user'],
        defaultValue: 'user'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[0-9]{10,20}$/
        }
    },
    lastLogin: DataTypes.DATE,
}, {
    paranoid: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(SALT_ROUNDS);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(SALT_ROUNDS);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.verifyPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

(async () => {
    await sequelize.sync({})
})();

module.exports = {
    User,
    sequelize
};