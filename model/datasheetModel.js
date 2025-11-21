const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// 1. Experiment Table
const Experiment = sequelize.define('Experiment', {
    // ID is automatically created by Sequelize as 'id'
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Experiment Name'
    },
    description: {
        type: DataTypes.TEXT,
        comment: 'Experiment Description'
    },
    creator: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Creator Name or ID'
    }
    // createdAt and updatedAt are automatically added by Sequelize
}, {
    tableName: 'experiments',
    comment: 'Stores basic experiment information'
});

// 2. Column Definition Table
const ColumnDefinition = sequelize.define('ColumnDefinition', {
    // ID is automatically created by Sequelize as 'id'
    fieldName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Internal field name'
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Display name for the field'
    },
    dataType: {
        type: DataTypes.ENUM('string', 'number', 'date', 'boolean', 'text'),
        allowNull: false,
        comment: 'Data type of the field'
    },
    isRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Is this field required?'
    },
    constraints: {
        type: DataTypes.JSON, // or TEXT if JSON is not supported by DB version, but MySQL 5.7+ supports JSON
        comment: 'Additional constraints or metadata'
    }
    // createdAt is automatically added. updatedAt is also added by default.
}, {
    tableName: 'column_definitions',
    comment: 'Metadata for experiment fields'
});

// 3. Experiment Data Table
const ExperimentData = sequelize.define('ExperimentData', {
    // ID is automatically created by Sequelize as 'id'
    data: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Stores the dynamic experiment data'
    }
    // createdAt and updatedAt are automatically added
}, {
    tableName: 'experiment_data',
    comment: 'Stores actual experiment data records'
});

// Associations
// Experiment has many ColumnDefinitions
Experiment.hasMany(ColumnDefinition, {
    foreignKey: 'experimentId',
    onDelete: 'CASCADE'
});
ColumnDefinition.belongsTo(Experiment, {
    foreignKey: 'experimentId'
});

// Experiment has many ExperimentData records
Experiment.hasMany(ExperimentData, {
    foreignKey: 'experimentId',
    onDelete: 'CASCADE'
});
ExperimentData.belongsTo(Experiment, {
    foreignKey: 'experimentId'
});

module.exports = {
    sequelize,
    Experiment,
    ColumnDefinition,
    ExperimentData
};
