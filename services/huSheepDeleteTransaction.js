const {sequelize, HuSheep, HuSheepIndex, AgeMilestone, Location} = require("../model/experimentalData/huSheepModel");

/**
 * 删除羊只信息
 * @param {number} sheepId - 羊只ID
 * @param {Object} options - 删除选项
 * @param {boolean} options.deleteIndexes - 是否同时删除关联的指标数据
 * @return {Promise<Object>} 删除结果
 */
async function huSheepDeleteTransaction(sheepId, options = {}) {
    return await sequelize.transaction(async (t) => {
        const sheep = await HuSheep.findByPk(sheepId, {transaction: t});
        if (!sheep) {
            throw new Error("No sheep was found with no transaction");
        }
        const deleteSheepInfo = {...sheep.toJSON()};
        if (options.deleteIndexes) {
            const indexes = await HuSheepIndex.findAll({where: {HuSheepId: sheepId}, transaction: t});
            // 获取删除了的表型数量
            deleteSheepInfo.deleteIndexes = indexes.length;

            await HuSheepIndex.destroy({where: {HuSheepId: sheepId}, transaction: t});
        } else {
            const indexCount = await HuSheepIndex.count({
                where: {HuSheepId: sheepId},
                transaction: t
            });
            if (indexCount > 0) {
                throw new Error("The sheep has associated data !");
            }
        }
        await sheep.destroy({transaction: t});

        return {
            success: true,
            message: `Successfully deleted sheep with ID ${sheepId}`,
            deleteSheepInfo
        }
    })
}

/**
 * 删除羊只指标数据
 * @param {number} indexId - 指标记录ID
 * @return {Promise<Object>} 删除结果
 */
async function deleteSheepIndexDeleteTransaction(indexId) {
    return await sequelize.transaction(async (t) => {
        const index = await HuSheepIndex.findByPk(indexId, {
            include: [
                {
                    model: HuSheep,
                    attributes: ['id', 'sheep_number']
                }
            ],
            transaction: t
        });
        if (!index) {
            throw new Error(`No sheepIndex was found with ID ${indexId}`);
        }
        const deleteIndexInfo = {...index.toJSON()};

        await index.destroy({transaction: t});
        return {
            success: true,
            message: `Successfully deleted sheepIndex with ID ${indexId}`,
            deleteIndexInfo
        }
    })
}

/**
 * 删除位置信息
 * @param {number} locationId - 位置ID
 * @param {Object} options - 删除选项
 * @param {boolean} options.force - 是否强制删除（即使有关联的羊只）
 * @param {number | null} options.transferToLocationId - 将关联的羊只转移到此位置ID
 * @return {Promise<Object>} 删除结果
 */
async function deleteLocationDeleteTransaction(locationId, options = {}) {
    return await sequelize.transaction(async (t) => {
        const location = await Location.findByPk(locationId, {transaction: t});
        if (!location) {
            throw new Error(`No Location was found with ID ${locationId}`);
        }
        const deletedLocationInfo = {...location.toJSON()};

        const associatedSheep = await HuSheep.findAll({
            where: {
                LocationId: locationId,
            },
            transaction: t
        });
        if (associatedSheep.length > 0) {
            if (!options.force && !options.transferToLocationId) {
                throw new Error(`There are ${associatedSheep.length} associated sheep, please remove them first.`);
            }
            if (options.transferToLocationId) {
                const targetLocation = await Location.findByPk(options.transferToLocationId, {transaction: t});
                if (!targetLocation) {
                    throw new Error(`No Location farms found with ID ${options.transferToLocationId}`);
                }
                await HuSheep.update(
                    {LocationId: options.transferToLocationId},
                    {where: {LocationId: locationId}},
                    {transaction: t}
                );
                deletedLocationInfo.transferredSheep = associatedSheep.length;
                deletedLocationInfo.transferToLocation = options.transferToLocationId
            } else if (options.force) {
                await HuSheep.update({LocationId: null}, {
                    where: {LocationId: locationId},
                    transaction: t
                });
                deletedLocationInfo.removedAssociations = associatedSheep.length;
            }
        }
        await location.destroy({transaction: t});
        return {
            success: true,
            message: `Successfully processed Location ID ${locationId}.` +
                (deletedLocationInfo.transferredSheep ? ` Transferred ${deletedLocationInfo.transferredSheep} sheep to Location ID ${deletedLocationInfo.transferToLocation}.` : '') +
                (deletedLocationInfo.removedAssociations ? ` Disassociated ${deletedLocationInfo.removedAssociations} sheep.` : '') +
                ` Location deleted.`,
            deletedLocationInfo
        }
    })
}

/**
 * 批量删除羊只
 * @param {Array<number>} sheepIds - 要删除的羊只ID数组
 * @param {Object} options - 删除选项
 * @param {boolean} options.deleteIndexes - 是否同时删除关联的指标数据
 * @return {Promise<Object>} 删除结果
 */
async function batchDeleteSheepTransaction(sheepIds, options = {}) {
    return await sequelize.transaction(async (t) => {
        const results = {
            success: [],
            failed: []
        }
        for (const sheepId of sheepIds) {
            const sheep = await HuSheep.findByPk(sheepId, {transaction: t});
            if (!sheep) {
                results.failed.push({
                    id: sheepId,
                    error: `No sheep found with ID ${sheepId}`
                });
            }

            if (options.deleteIndexes) {
                await HuSheepIndex.destroy({
                    where: {HuSheepId: sheepId},
                    transaction: t
                });
            } else {
                const indexCount = await HuSheepIndex.count({
                    where: {HuSheepId: sheepId},
                    transaction: t
                });

                if (indexCount > 0) {
                    results.failed.push({
                        id: sheepId,
                        error: `There are ${indexCount} pieces of associated data that cannot be directly deleted`
                    });
                }
            }
            await sheep.destroy({transaction: t});
            results.success.push(sheepId);
        }
        return results;
    })
}

/**
 *  删除年龄信息
 * @param ageMilestoneId - 年龄ID
 * @param {Object} options - 删除选项
 * @param {boolean} options.force - 是否强制删除
 * @param {number | null} options.transferToAgeMilestoneId - 关联羊转移至该年龄ID
 * @returns {Promise<Object>}
 */
async function deleteAgeMilestoneTransaction(ageMilestoneId, options = {}) {
    return await sequelize.transaction(async (t) => {
        const ageMilestone = await AgeMilestone.findByPk(ageMilestoneId);
        if (!ageMilestone) {
            throw new Error(`No ageMilestone was found with ID ${ageMilestoneId}`)
        }
        const deletedAgeMilestoneInfo = {...ageMilestone.toJSON()};

        const associatedHuSheepIndex = await HuSheepIndex.findAll({
            where: {AgeMilestoneId: ageMilestoneId},
            transaction: t
        });

        if (associatedHuSheepIndex > 0) {
            if (!options.force && !options.transferToAgeMilestoneId) {
                throw new Error(`There are ${associatedHuSheepIndex.length} associated sheepIndex, please remove them first.`);
            }
            if (options.transferToAgeMilestoneId) {
                const targetAgeMilestone = await AgeMilestone.findByPk(ageMilestoneId, {transaction: t});
                if (!targetAgeMilestone) {
                    throw new Error(`No sheep farms found with ID ${options.transferToAgeMilestoneId}`);
                }
                await HuSheepIndex.update({AgeMilestoneId: options.transferToAgeMilestoneId}, {
                    where: {AgeMilestoneId: ageMilestoneId},
                    transaction: t
                });
                deletedAgeMilestoneInfo.transferredSheepIndex = associatedHuSheepIndex.length;
                deletedAgeMilestoneInfo.transferToAgeMilestoneId = options.transferToAgeMilestoneId;
            }
        } else if (options.force) {
            await HuSheepIndex.update({AgeMilestoneId: null}, {
                where: {AgeMilestoneId: ageMilestoneId},
                transaction: t
            });

            deletedAgeMilestoneInfo.removedAssociations = associatedHuSheepIndex.length;
        }
        await ageMilestone.destroy({transaction: t});
        return {
            success: true,
            deletedAgeMilestoneInfo
        }
    })
}

module.exports = {
    huSheepDeleteTransaction,
    deleteSheepIndexDeleteTransaction,
    deleteLocationDeleteTransaction,
    batchDeleteSheepTransaction,
    deleteAgeMilestoneTransaction
}
