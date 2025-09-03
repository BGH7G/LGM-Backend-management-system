const newsService = require('../../services/lgmWeb/newsTransaction');

// GET /news 查询新闻列表
exports.get = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const sortBy = req.query.sortBy || 'publishedAt';
        const sortOrder = (req.query.sortOrder || 'DESC').toUpperCase();
        const status = req.query.status;          // published | draft | archived
        const categoryId = req.query.categoryId;  // 数字
        const tagId = req.query.tagId;            // 数字

        if (page < 1 || pageSize < 1 || !['ASC', 'DESC'].includes(sortOrder)) {
            return res.status(400).json({ success: false, msg: 'Invalid pagination or sorting parameters.' });
        }

        const result = await newsService.getAllNews({ page, pageSize, sortBy, sortOrder, status, categoryId, tagId });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve news.', error: error.message });
    }
};

// GET /news/:id  获取单条新闻含相关文章
exports.getById = async (req, res) => {
    try {
        const news = await newsService.getNewsById(req.params.id);
        if (!news) return res.status(404).json({ success: false, msg: 'News not found' });
        newsService.incrementViews(req.params.id); // 异步增加浏览量
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve news.', error: error.message });
    }
};

// POST /news/:id/like 点赞
exports.like = async (req, res) => {
    try {
        await newsService.likeNews(req.params.id, req.user.id);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'Already liked') return res.status(409).json({ success: false, msg: 'You have already liked this news.' });
        res.status(500).json({ success: false, msg: 'Failed to like news.', error: error.message });
    }
};

// POST /news - 创建新闻
exports.create = async (req, res) => {
    try {
        const coverFilename = req.file ? req.file.filename : undefined;
        const news = await newsService.createNews(req.body, req.user.id, coverFilename);
        res.status(201).json({ success: true, msg: 'News created successfully!', data: news });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to create news.', error: error.message });
    }
};

// POST /news/categories - 创建分类
exports.createCategory = async (req, res) => {
    try {
        const category = await newsService.createCategory(req.body);
        res.status(201).json({ success: true, msg: 'Category created successfully!', data: category });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to create category.', error: error.message });
    }
};

// POST /news/tags - 创建标签
exports.createTag = async (req, res) => {
    try {
        const tag = await newsService.createTag(req.body);
        res.status(201).json({ success: true, msg: 'Tag created successfully!', data: tag });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to create tag.', error: error.message });
    }
};

// PUT /news/:id - 更新新闻
exports.update = async (req, res) => {
    try {
        const news = await newsService.updateNews(req.params.id, req.body);
        res.status(200).json({ success: true, msg: 'News updated successfully!', data: news });
    } catch (error) {
        if (error.message === 'News not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to update news.', error: error.message });
    }
};

// PUT /news/categories/:id - 更新分类
exports.updateCategory = async (req, res) => {
    try {
        const category = await newsService.updateCategory(req.params.id, req.body);
        res.status(200).json({ success: true, msg: 'Category updated successfully!', data: category });
    } catch (error) {
        if (error.message === 'Category not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to update category.', error: error.message });
    }
};

// PUT /news/tags/:id - 更新标签
exports.updateTag = async (req, res) => {
    try {
        const tag = await newsService.updateTag(req.params.id, req.body);
        res.status(200).json({ success: true, msg: 'Tag updated successfully!', data: tag });
    } catch (error) {
        if (error.message === 'Tag not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to update tag.', error: error.message });
    }
};

// DELETE /news/:id - 删除新闻
exports.delete = async (req, res) => {
    try {
        await newsService.deleteNews(req.params.id);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'News not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to delete news.', error: error.message });
    }
};

// DELETE /news/categories/:id - 删除分类
exports.deleteCategory = async (req, res) => {
    try {
        await newsService.deleteCategory(req.params.id);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'Category not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to delete category.', error: error.message });
    }
};

// DELETE /news/tags/:id - 删除标签
exports.deleteTag = async (req, res) => {
    try {
        await newsService.deleteTag(req.params.id);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'Tag not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to delete tag.', error: error.message });
    }
};

// GET /news/categories - 查询全部分类
exports.getCategories = async (req, res) => {
    try {
        const categories = await newsService.getCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve categories.', error: error.message });
    }
};

// GET /news/tags - 查询全部标签
exports.getTags = async (req, res) => {
    try {
        const tags = await newsService.getTags();
        res.status(200).json({ success: true, data: tags });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve tags.', error: error.message });
    }
};