const {News, newsCategory, TagOfNews, NewsLike, sequelize} = require('../../model/lgmWeb/newsModel');
const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

// 获取所有新闻（支持分页、排序、状态、分类、标签筛选）
const getAllNews = async ({page, pageSize, sortBy, sortOrder, status, categoryId, tagId}) => {
    const t = await sequelize.transaction();
    try {
        const offset = (page - 1) * pageSize;

        // 基础查询条件
        const where = {};
        if (status) where.status = status;
        if (categoryId) where.newsCategoryId = categoryId; // Sequelize 会自动生成外键字段名称

        // include 数组
        const include = [
            {model: newsCategory},
            {model: TagOfNews, through: {attributes: []}}
        ];

        if (tagId) {
            // 仅关联指定 tag
            include[1].where = {id: tagId};
        }

        const result = await News.findAndCountAll({
            distinct: true,
            where,
            limit: pageSize,
            offset,
            order: [[sortBy, sortOrder]],
            include,
            transaction: t
        });

        await t.commit();
        return {
            totalItems: result.count,
            items: result.rows,
            totalPages: Math.ceil(result.count / pageSize),
            currentPage: page
        };
    } catch (e) {
        await t.rollback();
        throw e;
    }
};

// 创建新闻
const createNews = async (newsData, authorId, coverFilename) => {
    const t = await sequelize.transaction();
    try {
        const {categoryId, tagIds = newsData.tags, relatedIds, ...rest} = newsData;


        // 创建新闻主记录
        const payload = { ...rest, authorId };
        if (coverFilename) {
            payload.coverImage = `${BASE_URL}/public/images/${coverFilename}`;
        }
        const news = await News.create(payload, {transaction: t});

        // 关联分类
        if (categoryId) {
            const category = await newsCategory.findByPk(categoryId, {transaction: t});
            if (category) await news.setNewsCategory(category, {transaction: t});
        }

        // 关联标签
        if (tagIds && tagIds.length) {
            const tags = await TagOfNews.findAll({where: {id: tagIds}, transaction: t});
            await news.setTagOfNews(tags, {transaction: t});
        }

        if (relatedIds && relatedIds.length) {
            const related = await News.findAll({ where: { id: relatedIds }, transaction: t });
            await news.setRelated(related, { transaction: t });   // 'Related' 来自 as: 'Related'
        }

        await t.commit();
        return news;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// 创建分类
const createCategory = async (data) => await newsCategory.create(data);

// 创建标签
const createTag = async (data) => await TagOfNews.create(data);

// 更新新闻
const updateNews = async (id, data) => {
    const t = await sequelize.transaction();
    try {
        const news = await News.findByPk(id, {transaction: t});
        if (!news) throw new Error('News not found');

        const {categoryId, tagIds, ...rest} = data;
        await news.update(rest, {transaction: t});

        if (categoryId !== undefined) {
            const category = await newsCategory.findByPk(categoryId, {transaction: t});
            await news.setNewsCategory(category, {transaction: t});
        }

        if (tagIds) {
            const tags = await TagOfNews.findAll({where: {id: tagIds}, transaction: t});
            await news.setTagOfNews(tags, {transaction: t});
        }

        await t.commit();
        return news;
    } catch (e) {
        await t.rollback();
        throw e;
    }
};

// 更新分类 / 标签
const updateCategory = async (id, data) => {
    const category = await newsCategory.findByPk(id);
    if (!category) throw new Error('Category not found');
    return await category.update(data);
};

const updateTag = async (id, data) => {
    const tag = await TagOfNews.findByPk(id);
    if (!tag) throw new Error('Tag not found');
    return await tag.update(data);
};

// 删除新闻
const deleteNews = async (id) => {
    const news = await News.findByPk(id);
    if (!news) throw new Error('News not found');
    return await news.destroy();
};

// 删除分类
const deleteCategory = async (id) => {
    const category = await newsCategory.findByPk(id);
    if (!category) throw new Error('Category not found');
    return await category.destroy();
};

// 删除标签
const deleteTag = async (id) => {
    const tag = await TagOfNews.findByPk(id);
    if (!tag) throw new Error('Tag not found');
    return await tag.destroy();
};

// 获取所有分类
const getCategories = async () => {
    return await newsCategory.findAll({order: [['name', 'ASC']]});
};

// 获取所有标签
const getTags = async () => {
    return await TagOfNews.findAll({order: [['name', 'ASC']]});
};

// 获取指定新闻（含分类、标签、相关文章）
const getNewsById = async (id) => {
    return await News.findByPk(id, {
        include: [
            { model: newsCategory },
            { model: TagOfNews, through: { attributes: [] } },
            { model: News, as: 'Related', through: { attributes: [] }, include: [
                { model: newsCategory },
                { model: TagOfNews, through: { attributes: [] } }
            ] }
        ]
    });
};

// 浏览量递增（异步调用即可）
const incrementViews = async (id) => {
    await News.increment({ views: 1 }, { where: { id } });
};

// 点赞（防重复）
const likeNews = async (newsId, userId) => {
    const t = await sequelize.transaction();
    try {
        // 防重复
        const [like, created] = await NewsLike.findOrCreate({ where: { newsId, userId }, defaults: {}, transaction: t });
        if (!created) throw new Error('Already liked');
        await News.increment({ likes: 1 }, { where: { id: newsId }, transaction: t });
        await t.commit();
    } catch (e) {
        await t.rollback();
        throw e;
    }
};

module.exports = {
    getAllNews,
    getNewsById,
    createNews,
    createCategory,
    createTag,
    updateNews,
    updateCategory,
    updateTag,
    deleteNews,
    deleteCategory,
    deleteTag,
    getCategories,
    getTags,
    incrementViews,
    likeNews
};