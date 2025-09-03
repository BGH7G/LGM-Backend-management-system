const {sequelize, Image, Category, Album} = require('../model/imageModel');

/**
 * 分页获取图片数据
 * @param {Object} options - 分页选项
 * @param {number} options.page - 页码
 * @param {number} options.pageSize - 每页记录数
 * @param {String} options.sortBy - 排序字段
 * @param {String} options.sortOrder - 排序方向
 * @param {Object} options.filters - 筛选条件
 * @param {Array} options.includeModels - 需要包含的关联模型
 * @param {number} options.albumId - 相册ID
 * @returns {Promise<Object>} - 包含图片数据和分页信息的对象
 */
async function imageGetAllTransaction(options = {}) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'DESC';
    const filters = options.filters || {};

    // 若带 albumId 过滤
    if (options.albumId) {
        filters.AlbumId = options.albumId;
    }
    const offset = (page - 1) * pageSize;

    // 准备包含的关联模型
    const includeModels = [];

    // 根据选项决定要包含的模型
    if (!options.includeModels || options.includeModels.includes('Category')) {
        includeModels.push({
            model: Category,
            attributes: ['id', 'name','description']
        });
    }

    // 可选包含 Album 信息
    if (options.includeModels && options.includeModels.includes('Album')) {
        includeModels.push({
            model: Album,
            attributes: ['id','name','description','cover']
        });
    }

    return await sequelize.transaction(async (t) => {
        try {
            // 构建查询条件
            const whereClause = { ...filters };

            // 计算总记录数
            const totalCount = await Image.count({
                where: whereClause,
                transaction: t
            });

            // 计算总页数
            const totalPages = Math.ceil(totalCount / pageSize);

            // 查询图片数据
            const images = await Image.findAll({
                where: whereClause,
                include: includeModels,
                order: [[sortBy, sortOrder]],
                limit: pageSize,
                offset: offset,
                transaction: t
            });

            // 返回分页数据和分页信息
            return {
                data: images,
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
            console.error('获取图片数据失败:', error);
            throw error;
        }
    });
}

/**
 * Express路由处理函数 - 获取图片列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function imageGetRoute(req, res) {
    try {
        // 从请求中获取参数
        const options = {
            page: parseInt(req.query.page) || 1,
            pageSize: parseInt(req.query.pageSize) || 10,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'DESC',
            filters: req.query.filters ? JSON.parse(req.query.filters) : {},
            includeModels: req.query.includeModels ? JSON.parse(req.query.includeModels) : null,
            albumId: req.query.albumId ? parseInt(req.query.albumId) : null
        };

        // 调用事务函数获取数据
        const result = await imageGetAllTransaction(options);

        // 返回成功响应
        res.status(200).json({
            msg: 'The images query was successful!',
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('图片查询路由错误:', error);
        res.status(500).json({
            msg: 'The images query failed!',
            error: error.message
        });
    }
}

module.exports = {
    imageGetAllTransaction,
    imageGetRoute
};