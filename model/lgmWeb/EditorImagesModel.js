const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const EditorImage = sequelize.define('EditorImage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    originalName: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    mime: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    uploaderId: { type: DataTypes.INTEGER }
});

module.exports ={
    EditorImage,
    sequelize
};