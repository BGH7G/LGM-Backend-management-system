const {DataTypes} = require('sequelize');

const sequelize = require('./index');
const Sample = sequelize.define(
    'Sample',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
            defaultValue: 0
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: 'This is a sample'
        },
        location: {
            type: DataTypes.STRING
        }
    }
);
const Buyer = sequelize.define('Buyer', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact:{
        type: DataTypes.STRING
    },
    department:{
        type: DataTypes.STRING
    }
});
const Tag = sequelize.define('Tag', {
   name:{
       type: DataTypes.STRING,
       allowNull: false,
       unique: true
   }
});

Buyer.hasMany(Sample);
Sample.belongsTo(Buyer);

Sample.belongsToMany(Tag, {through: 'SampleTag'});
Tag.belongsToMany(Sample, {through: 'SampleTag'});

(async () => {
    await sequelize.sync({})
})()

module.exports = {
    sequelize,
    Sample,
    Buyer,
    Tag
};