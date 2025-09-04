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

const Album = sequelize.define('Album', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 30],
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cover: {
        type: DataTypes.TEXT,
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
Album.hasMany(Image);
Image.belongsTo(Album);

module.exports = {
    sequelize,
    Image,
    Category,
    Album
}
