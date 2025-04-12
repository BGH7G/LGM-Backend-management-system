const {sequelize, HuSheep, HuSheepIndex, AgeMilestone, Location} = require("../model/experimentalData/huSheepModel");

async function huSheepPostTransaction(data) {
    return await sequelize.transaction(async (t) => {
        const {location, sheepData} = data;
        let locationRecord = null
        if (location) {
            [locationRecord] = await Location.findOrCreate({
                where: {farm_name: location.farm_name},
                defaults: location,
                transaction: t
            })
        }
        const sheepRecords = await Promise.all(
            sheepData.map(async (sheep) => {
                const results = await HuSheep.create({
                    sheep_number: sheep.sheep_number,
                    birth_date: sheep.birth_date,
                    gender: sheep.gender,
                    pregnant: sheep.pregnant || false,
                    notes: sheep.notes,
                }, {transaction: t});

                if (locationRecord) {
                    await locationRecord.addHuSheep(results, {transaction: t});
                }

                return results;
            })
        );
        return {
            location: locationRecord,
            sheepData: sheepRecords
        }
    });
}

async function ageMilestonePostTransaction(ageMilestoneData) {
    return await sequelize.transaction(async (t) => {
        return await AgeMilestone.create({
            age_days: ageMilestoneData.age_days,
            milestone_name: ageMilestoneData.milestone_name,
            description: ageMilestoneData.description
        }, {transaction: t});
    })
}

async function huSheepIndexPostTransaction(huSheepIndexData) {
    return await sequelize.transaction(async (t) => {
        const {milestone, indexData} = huSheepIndexData;
            const milestoneInfo = await AgeMilestone.findAll({
                where: {
                    age_days: milestone
                },
                transaction: t
            }
        );
        const milestoneId = milestoneInfo[0].dataValues.id
        // ```````````````
        if (!milestoneInfo) {
            throw new Error('The Age milestone was not found');
        }

        // index 的数据结构可以直接输入
        return await Promise.all(
            indexData.map(async (index) => {
                // 确保index中包含sheep_id或HuSheepId字段来关联羊只
                if (!index.HuSheepId && !index.sheep_id) {
                    throw new Error('Sheep ID is required for each index record');
                }

                const sheepId = index.HuSheepId || index.sheep_id;
                const sheep = await HuSheep.findByPk(sheepId, {transaction: t});

                if (!sheep) {
                    throw new Error(`Sheep with ID ${sheepId} not found`);
                }

                // 创建索引记录
                return await HuSheepIndex.create({
                    ...index,
                    HuSheepId: sheepId,
                    AgeMilestoneId: milestoneId
                }, {transaction: t});
            })
        );

    });
}

module.exports = {
    huSheepPostTransaction,
    ageMilestonePostTransaction,
    huSheepIndexPostTransaction
}