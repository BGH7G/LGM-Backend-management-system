const {sequelize, Sample, Buyer, Tag} = require('../model/sampleModel')

/**
 * 分页获取样本数据
 * @param {Object} options - 分页选项
 * @param {number} options.page - 页码
 * @param {number} options.pageSize - 每页记录数
 * @param {String} options.sortBy - 排序字段
 * @param {String} options.sortOrder - 排序方向
 * @param {Object} options.filters - 筛选条件
 * @param {Array} options.includeModels - 需要包含的关联模型
 * @returns {Promise<Object>} - 包含样本数据和分页信息的对象
 */
async function sampleGetAllTransaction(options = {}) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 50;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'DESC';
    const filters = options.filters || {};
    const offset = (page - 1) * pageSize;

    // 准备包含的关联模型
    const includeModels = [];

    // 根据选项决定要包含的模型
    if (!options.includeModels || options.includeModels.includes('Tag')) {
        includeModels.push({
            model: Tag,
            attributes: ['id', 'name']
        });
    }

    if (!options.includeModels || options.includeModels.includes('Buyer')) {
        includeModels.push({
            model: Buyer
        });
    }

    // 使用事务保证数据一致性
    return await sequelize.transaction(async (t) => {
        try {
            // 构建查询条件
            const whereClause = { ...filters };

            // 计算总记录数
            const totalCount = await Sample.count({
                where: whereClause,
                transaction: t
            });

            // 计算总页数
            const totalPages = Math.ceil(totalCount / pageSize);

            // 查询样本数据
            const samples = await Sample.findAll({
                where: whereClause,
                include: includeModels,
                order: [[sortBy, sortOrder]],
                limit: pageSize,
                offset: offset,
                transaction: t
            });

            // 返回分页数据和分页信息
            return {
                data: samples,
                pagination: {
                    totalItems: totalCount,
                    totalPages: totalPages,
                    currentPage: page,
                    pageSize: pageSize,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            console.error('获取样本数据失败:', error);
            throw error;
        }
    });
}

module.exports = {
    sampleGetAllTransaction
};
