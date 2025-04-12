const {sequelize, HuSheep, HuSheepIndex, AgeMilestone, Location} = require("../model/experimentalData/huSheepModel");

/**
 * 更新羊只基本信息
 * 根据前端用户传入的location内容判断是是否新增Location数据
 * @param {number} sheepId - 羊只ID
 * @param {Object} sheepData - 要更新的羊只数据
 * @param {Object} options - 附加选项
 * @param {boolean} options.updateLocation - 是否同时更新位置信息
 * @param {Object} options.locationData - 位置信息数据
 * @return {Promise<Object>} 更新后的羊只信息
 */
async function huSheepUpdateTransaction(sheepId, sheepData, options = {}) {
    return await sequelize.transaction(async (t) => {
        // 先去拿实例
        const sheep = await HuSheep.findByPk(sheepId, {transaction: t});
        if (!sheep) {
            throw new Error('No sheep found.');
        }
        // 直接更新主要数据
        await sheep.update(sheepData, {transaction: t});
        // 进行关联数据更新
        if (options.updateLocation && options.locationData) {
            if (options.locationData.id) {
                // 使用现有位置
                await sheep.update({LocationId: options.locationData.id}, {transaction: t});
            } else if (options.locationData.create) {
                // 创建新位置
                const newLocation = await Location.create(options.locationData, {transaction: t});
                await sheep.update({LocationId: newLocation.id}, {transaction: t});
            }
        }
        return await HuSheep.findByPk(sheepId, {
            include: [
                {
                    model: Location,
                    attributes: [
                        'id', 'farm_name', 'address', 'region',
                        'climate_info', 'coordinates', 'createdAt', 'updatedAt'
                    ]
                }
            ],
            transaction: t
        });
    })
}

/**
 * 更新羊只指标数据
 * @param {number} indexId - 指标记录ID
 * @param {Object} indexData - 要更新的指标数据
 * @param {Object} options - 附加选项
 * @param {boolean} options.updateMilestone - 是否更新年龄里程碑
 * @param {number} options.milestoneId - 年龄里程碑ID
 * @param {number} options.HuSheepId - 湖羊ID
 * @param {number} options.updateHuSheep - 是否更新所属羊
 * @return {Promise<Object>} 更新后的指标信息
 */
async function huSheepIndexUpdateTransaction(indexId, indexData, options = {}) {
    return await sequelize.transaction(async (t) => {

        // 先找到要修改的实例
        const index = await HuSheepIndex.findByPk(indexId, {transaction: t});
        if (!index) {
            throw new Error('No sheepIndex found.');
        }
        // 主要数据更新
        await index.update(indexData, {transaction: t});

        // 进行关联数据的更新
        if (options.updateMilestone && options.milestoneId) {
            await index.update({
                AgeMilestoneId: options.milestoneId,
                HuSheepId: options.HuSheepId
            }, {transaction: t});
        }
        // 返回给前端更新后的数据
        return await HuSheepIndex.findByPk(indexId, {
            include: [
                {
                    model: AgeMilestone,
                    attributes: ['id', 'age_days', 'milestone_name', 'description']
                },
                {
                    model: HuSheep,
                    attributes: ['id', 'sheep_number', 'birth_date', 'gender', 'pregnant', 'notes']
                }
            ],
            transaction: t
        });
    })
}

/**
 * 更新位置信息
 * @param {number} locationId - 位置ID
 * @param {Object} locationData - 要更新的位置数据
 * @return {Promise<Object>} 更新后的位置信息
 */
async function locationUpdateTransaction(locationId, locationData) {
    return await sequelize.transaction(async (t) => {
        const location = await Location.findByPk(locationId, {transaction: t});
        if (!location) {
            throw new Error('Location not found.');
        }
        await location.update(locationData, {transaction: t});

        const updatedLocation = await Location.findByPk(locationId, {
            transaction: t
        });

        // 获取该位置🐏的数量
        const sheepCount = await HuSheep.count({
            where: {LocationId: locationId},
            transaction: t
        });

        return {
            ...updatedLocation.toJSON(),
            sheepCount
        }
    })
}

/**
 * 更新年龄信息
 * @param ageMilestoneId
 * @param ageMilestoneData
 * @return {Promise<Object>} 更新后的信息
 */

async function ageMilestoneUpdateTransaction(ageMilestoneId, ageMilestoneData) {
    return await sequelize.transaction(async (t) => {
        const ageMilestone = await AgeMilestone.findByPk(ageMilestoneId, {transaction: t});
        if (!ageMilestone) {
            throw new Error('No ageMilestone found.');
        }
        console.log(ageMilestoneData)
        const data = await ageMilestone.update(ageMilestoneData, {transaction: t});
        console.log(data)

        const updateAgeMilestone = await AgeMilestone.findByPk(ageMilestoneId, {transaction: t});

        const sheepCount = await HuSheepIndex.count({
            where: {AgeMilestoneId: ageMilestoneId},
            transaction: t
        });

        return {
            ...updateAgeMilestone.toJSON(),
            sheepCount
        }
    })
}

module.exports = {
    huSheepUpdateTransaction,
    huSheepIndexUpdateTransaction,
    locationUpdateTransaction,
    ageMilestoneUpdateTransaction
}