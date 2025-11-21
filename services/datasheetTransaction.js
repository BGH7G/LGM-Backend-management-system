const { Experiment, ColumnDefinition, ExperimentData, sequelize } = require('../model/datasheetModel');
const { Op } = require('sequelize');

/**
 * Create a new experiment
 * @param {Object} experimentInfo - { name, description, creator }
 */
exports.createExperimentTransaction = async (experimentInfo) => {
    return await sequelize.transaction(async (t) => {
        const experiment = await Experiment.create(experimentInfo, { transaction: t });
        return experiment;
    });
};

/**
 * Get experiments with filters
 * @param {Object} filter - { creator, name }
 */
exports.getExperimentsTransaction = async (filter = {}) => {
    const where = {};
    if (filter.creator) {
        where.creator = filter.creator;
    }
    if (filter.name) {
        where.name = { [Op.like]: `%${filter.name}%` };
    }
    return await Experiment.findAll({
        where,
        order: [['createdAt', 'DESC']]
    });
};

/**
 * Delete an experiment and all related data (Cascade)
 * @param {String} experimentId
 */
exports.deleteExperimentTransaction = async (experimentId) => {
    return await sequelize.transaction(async (t) => {
        const deleted = await Experiment.destroy({
            where: { id: experimentId },
            transaction: t
        });
        if (deleted === 0) {
            throw new Error('Experiment not found');
        }
        return true;
    });
};

/**
 * Add column definitions to an experiment
 * @param {String} experimentId
 * @param {Array} columns - Array of { fieldName, displayName, dataType, isRequired, constraints }
 */
exports.addColumnDefinitionTransaction = async (experimentId, columns) => {
    return await sequelize.transaction(async (t) => {
        const experiment = await Experiment.findByPk(experimentId, { transaction: t });
        if (!experiment) {
            throw new Error('Experiment not found');
        }

        const fieldNameRegex = /^[a-zA-Z0-9_]+$/;
        const reservedKeywords = ['id', 'createdAt', 'updatedAt', 'data', 'experimentId'];

        for (const col of columns) {
            if (!fieldNameRegex.test(col.fieldName)) {
                throw new Error(`Invalid field name: '${col.fieldName}'. Only alphanumeric characters and underscores are allowed.`);
            }
            if (reservedKeywords.includes(col.fieldName.toLowerCase())) {
                throw new Error(`Field name '${col.fieldName}' is a reserved keyword.`);
            }
        }

        const columnDefs = columns.map(col => ({
            ...col,
            experimentId
        }));

        const createdColumns = await ColumnDefinition.bulkCreate(columnDefs, { transaction: t });
        return createdColumns;
    });
};

/**
 * Update a column definition
 * @param {String} experimentId
 * @param {String} columnId
 * @param {Object} updates
 */
exports.updateColumnDefinitionTransaction = async (experimentId, columnId, updates) => {
    return await sequelize.transaction(async (t) => {
        const column = await ColumnDefinition.findOne({
            where: { id: columnId, experimentId },
            transaction: t
        });

        if (!column) {
            throw new Error('Column not found');
        }

        await column.update(updates, { transaction: t });
        return column;
    });
};

/**
 * Delete a column definition
 * @param {String} experimentId
 * @param {String} columnId
 */
exports.deleteColumnDefinitionTransaction = async (experimentId, columnId) => {
    return await sequelize.transaction(async (t) => {
        const deleted = await ColumnDefinition.destroy({
            where: { id: columnId, experimentId },
            transaction: t
        });
        if (deleted === 0) {
            throw new Error('Column not found');
        }
        // Note: We do not modify the JSON data in ExperimentData. 
        // The data for this field will remain in the JSON but won't be shown if the UI relies on ColumnDefinition.
        return true;
    });
};

/**
 * Add data to an experiment with validation
 * @param {String} experimentId
 * @param {Object} data - The JSON data to add
 */
exports.addDataTransaction = async (experimentId, data) => {
    return await sequelize.transaction(async (t) => {
        const columns = await ColumnDefinition.findAll({
            where: { experimentId },
            transaction: t
        });

        if (!columns || columns.length === 0) {
            throw new Error('No column definitions found for this experiment');
        }

        const validatedData = validateDataAgainstColumns(data, columns);

        const experimentData = await ExperimentData.create({
            experimentId,
            data: validatedData
        }, { transaction: t });

        return experimentData;
    });
};

/**
 * Batch import data
 * @param {String} experimentId
 * @param {Array} dataArray - Array of JSON objects
 */
exports.batchImportDataTransaction = async (experimentId, dataArray) => {
    return await sequelize.transaction(async (t) => {
        let columns = await ColumnDefinition.findAll({
            where: { experimentId },
            transaction: t
        });

        let recordsToProcess = dataArray;

        if (!columns || columns.length === 0) {
            if (dataArray.length === 0) {
                throw new Error('No data to infer columns from');
            }

            // Auto-create columns from first row
            const firstRow = dataArray[0];
            const newColumns = [];
            const keyMap = {}; // original header -> new fieldName
            const reservedKeywords = ['id', 'createdAt', 'updatedAt', 'data', 'experimentId'];

            for (const key of Object.keys(firstRow)) {
                let fieldName = key.replace(/[^a-zA-Z0-9_]/g, '_');

                // Handle empty or reserved keywords
                if (!fieldName || reservedKeywords.includes(fieldName.toLowerCase()) || /^\d/.test(fieldName)) {
                    fieldName = 'col_' + fieldName;
                }

                // Ensure uniqueness
                let uniqueFieldName = fieldName;
                let counter = 1;
                while (newColumns.some(c => c.fieldName === uniqueFieldName)) {
                    uniqueFieldName = `${fieldName}_${counter}`;
                    counter++;
                }

                keyMap[key] = uniqueFieldName;
                newColumns.push({
                    experimentId,
                    fieldName: uniqueFieldName,
                    displayName: key,
                    dataType: 'string', // Default to string
                    isRequired: false
                });
            }

            columns = await ColumnDefinition.bulkCreate(newColumns, { transaction: t });

            // Transform data to match new fieldNames
            recordsToProcess = dataArray.map(row => {
                const newRow = {};
                for (const key of Object.keys(row)) {
                    if (keyMap[key]) {
                        newRow[keyMap[key]] = row[key];
                    }
                }
                return newRow;
            });
        }

        const recordsToCreate = [];
        for (const data of recordsToProcess) {
            const validatedData = validateDataAgainstColumns(data, columns);
            recordsToCreate.push({
                experimentId,
                data: validatedData
            });
        }

        const createdRecords = await ExperimentData.bulkCreate(recordsToCreate, { transaction: t });
        return createdRecords;
    });
};

/**
 * Update existing data record
 * @param {String} experimentId
 * @param {String} dataId
 * @param {Object} newData
 */
exports.updateDataTransaction = async (experimentId, dataId, newData) => {
    return await sequelize.transaction(async (t) => {
        const record = await ExperimentData.findOne({
            where: { id: dataId, experimentId },
            transaction: t
        });

        if (!record) {
            throw new Error('Data record not found');
        }

        const columns = await ColumnDefinition.findAll({
            where: { experimentId },
            transaction: t
        });

        const mergedData = { ...record.data, ...newData };
        const validatedData = validateDataAgainstColumns(mergedData, columns);

        record.data = validatedData;
        await record.save({ transaction: t });

        return record;
    });
};

/**
 * Delete a data record
 * @param {String} experimentId
 * @param {String} dataId
 */
exports.deleteDataTransaction = async (experimentId, dataId) => {
    return await sequelize.transaction(async (t) => {
        const deletedCount = await ExperimentData.destroy({
            where: { id: dataId, experimentId },
            transaction: t
        });

        if (deletedCount === 0) {
            throw new Error('Data record not found');
        }
        return true;
    });
};

/**
 * Batch delete data records
 * @param {String} experimentId
 * @param {Array} dataIds
 */
exports.batchDeleteDataTransaction = async (experimentId, dataIds) => {
    return await sequelize.transaction(async (t) => {
        const deletedCount = await ExperimentData.destroy({
            where: {
                id: dataIds,
                experimentId
            },
            transaction: t
        });
        return deletedCount;
    });
};

/**
 * Helper function to validate data
 */
function validateDataAgainstColumns(data, columns) {
    const validatedData = {};

    for (const col of columns) {
        const value = data[col.fieldName];

        if (col.isRequired && (value === undefined || value === null || value === '')) {
            throw new Error(`Field '${col.displayName}' (${col.fieldName}) is required`);
        }

        if (value !== undefined && value !== null) {
            switch (col.dataType) {
                case 'number':
                    if (isNaN(Number(value))) {
                        throw new Error(`Field '${col.displayName}' must be a number`);
                    }
                    validatedData[col.fieldName] = Number(value);
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
                        throw new Error(`Field '${col.displayName}' must be a boolean`);
                    }
                    validatedData[col.fieldName] = (value === true || value === 'true');
                    break;
                case 'date':
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        throw new Error(`Field '${col.displayName}' must be a valid date`);
                    }
                    validatedData[col.fieldName] = value;
                    break;
                default:
                    validatedData[col.fieldName] = String(value);
            }
        }
    }
    return validatedData;
}

/**
 * Get experiment details including columns
 * @param {String} experimentId
 */
exports.getExperimentDetailsTransaction = async (experimentId) => {
    const experiment = await Experiment.findByPk(experimentId, {
        include: [{
            model: ColumnDefinition
        }]
    });
    return experiment;
};

/**
 * Get data for an experiment with pagination and JSON filtering
 * @param {String} experimentId
 * @param {Object} filters - Key-value pairs to match in JSON
 * @param {Number} page - Page number (1-based)
 * @param {Number} limit - Page size
 */
exports.getExperimentDataTransaction = async (experimentId, filters = {}, page = 1, limit = 10, sortBy, sortOrder = 'ASC') => {
    const offset = (page - 1) * limit;
    const whereClause = { experimentId };

    const andConditions = [];

    for (const [key, value] of Object.entries(filters)) {
        // 添加验证：只允许字母、数字、下划线
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
            throw new Error(`Invalid filter key: ${key}`);
        }
        andConditions.push(
            sequelize.where(
                sequelize.fn('JSON_UNQUOTE', sequelize.fn('JSON_EXTRACT', sequelize.col('data'), `$.${key}`)),
                Op.eq,
                value
            )
        );
    }

    if (andConditions.length > 0) {
        whereClause[Op.and] = andConditions;
    }

    let order = [['createdAt', 'DESC']];
    if (sortBy) {
        const topLevelColumns = ['createdAt', 'updatedAt', 'id'];
        if (topLevelColumns.includes(sortBy)) {
            order = [[sortBy, sortOrder.toUpperCase()]];
        } else {
            // 添加验证：只允许字母、数字、下划线
            if (!/^[a-zA-Z0-9_]+$/.test(sortBy)) {
                throw new Error(`Invalid sortBy field: ${sortBy}`);
            }
            // 使用 sequelize.literal 和 CAST 来处理可能为 NULL 的情况
            order = [[sequelize.literal(`CAST(JSON_UNQUOTE(JSON_EXTRACT(\`data\`, '$.${sortBy}')) AS CHAR)`), sortOrder.toUpperCase()]];
        }
    }

    try {
        const { count, rows } = await ExperimentData.findAndCountAll({
            where: whereClause,
            order: order,
            limit: Number(limit),
            offset: Number(offset),
            raw: false
        });

        return {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / limit),
            data: rows
        };
    } catch (err) {
        console.error('Database query error:', err);
        throw new Error(`Failed to fetch experiment data: ${err.message}`);
    }
};

/**
 * Get all data for export (no pagination)
 * @param {String} experimentId
 */
exports.getAllExperimentDataForExportTransaction = async (experimentId) => {
    return await ExperimentData.findAll({
        where: { experimentId },
        order: [['createdAt', 'DESC']]
    });
};
