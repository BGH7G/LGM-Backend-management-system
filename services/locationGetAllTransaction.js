const {sequelize, Location, HuSheep} = require("../model/experimentalData/huSheepModel");

/**
 * 获取所有位置
 * @returns {Promise<Object>}
 */
async function locationGetAllTransaction() {
    return await sequelize.transaction(async (t) => {
        const locations = await Location.findAll({transaction: t});
        return await Promise.all(locations.map(async (location) => {
            const sheepCount = await HuSheep.count({where: {LocationId: location.id}, transaction: t});
            return {...location.toJSON(), sheepCount};
        }));
    });
}

module.exports = {
    locationGetAllTransaction
}
