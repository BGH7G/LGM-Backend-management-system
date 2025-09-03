const {sequelize, HuSheep, HuSheepIndex, AgeMilestone, Location} = require("../model/experimentalData/huSheepModel");

/**
 * 分页获取数据
 * @param {Object} options - 分页选项
 * @param {number} options.page - 分页页数
 * @param {number} options.pageSize - 每页展示的数据量
 * @param {String} options.sortBy - 按~数据展示
 * @param {String} options.sortOrder - 排序
 * @param {Object} options.filters - 其他筛选条件
 * @returns {Promise<Object>} - 获取数据
 */
async function huSheepGetAllTransaction(options = {}) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const sortBy = options.sortBy || 'id';
    const sortOrder = options.sortOrder || 'ASC';
    const filters = options.filters || {};

    const offset = (page - 1) * pageSize;
    return await sequelize.transaction(async (t) => {
        const whereClause = {...filters};
        const totalCount = await HuSheep.count({
            where: whereClause,
            transaction: t
        });
        const totalPages = Math.ceil(totalCount / pageSize);
        const sheepList = await HuSheep.findAll({
            where: whereClause,
            include: [
                {
                    model: Location,
                    attributes: [
                        'id', 'farm_name', 'address', 'region',
                        'climate_info', 'coordinates', 'createdAt', 'updatedAt'
                    ]
                }
            ],
            distinct: true,
            order: [[sortBy, sortOrder]],
            limit: pageSize,
            offset: offset,
            transaction: t
        });
        const sheepWithIndexData = await Promise.all(sheepList.map(async (sheep) => {
            // 获取该羊的最新指标数据
            const latestIndex = await HuSheepIndex.findOne({
                where: {HuSheepId: sheep.id},
                include: [
                    {
                        model: AgeMilestone,
                        attributes: ['id', 'age_days', 'milestone_name', 'description']
                    }
                ],
                order: [['createdAt', 'DESC']],
                transaction: t
            });
            // 转换为普通对象
            const sheepData = sheep.toJSON();
            // 添加最新指标数据
            sheepData.latestIndex = latestIndex ? latestIndex.toJSON() : null;

            return sheepData;
        }));
        return {
            data: sheepWithIndexData,
            pagination: {
                totalItems: totalCount,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    })
}

module.exports = {
    huSheepGetAllTransaction
}