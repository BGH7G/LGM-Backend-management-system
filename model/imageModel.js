const {DataTypes} = require('sequelize');

const sequelize = require('./index');
const Image = sequelize.define('Image', {
    filename:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path:{
        type: DataTypes.STRING,
        allowNull: false
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
    }
});

Category.hasMany(Image);
Image.belongsTo(Category);

(async () => {
    await sequelize.sync({})
})()

module.exports = {
    sequelize,
    Image,
    Category
}
