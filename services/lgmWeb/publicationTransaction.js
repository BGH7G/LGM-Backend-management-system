// Publication service layer with transactional operations
const {
    Publication,
    Author,
    Venue,
    PublicationType,
    ResearchCategory,
    Keyword,
    sequelize,
    PublicationAuthor
} = require('../../model/lgmWeb/publicationModel');

// 创建论文
const createPublication = async (data) => {
    const t = await sequelize.transaction();
    try {

        const {
            venueId,
            typeId = data.publicationTypeId,
            categoryId = data.researchCategoryId,
            authorIds = data.authors,
            keywordIds = data.keywords,
            ...rest
        } = data;

        const payloadCreate = { ...rest };
        if (payloadCreate.doi === '') payloadCreate.doi = null;
        if (payloadCreate.pdfUrl === '') payloadCreate.pdfUrl = null;
        if (payloadCreate.codeUrl === '') payloadCreate.codeUrl = null;
        const publication = await Publication.create(payloadCreate, {transaction: t});

        if (venueId) {
            const venue = await Venue.findByPk(venueId, {transaction: t});
            if (venue) await publication.setVenue(venue, {transaction: t});
        }
        if (typeId) {
            const type = await PublicationType.findByPk(typeId, {transaction: t});
            if (type) await publication.setPublicationType(type, {transaction: t});
        }
        if (categoryId) {
            const category = await ResearchCategory.findByPk(categoryId, {transaction: t});
            if (category) await publication.setResearchCategory(category, {transaction: t});
        }
        if (authorIds !== undefined) {
            await publication.setAuthors([], { transaction: t });
            const flatIds = authorIds
                .map(a => (a && typeof a === 'object') ? (a.id ?? a.authorId) : a)
                .filter(id => id != null);
            const existing = await Author.findAll({ where: { id: flatIds }, transaction: t });
            const existingSet = new Set(existing.map(a => a.id));
            for (let i = 0; i < authorIds.length; i++) {
                const item = authorIds[i];
                const id = (item && typeof item === 'object') ? (item.id ?? item.authorId) : item;
                if (id == null || !existingSet.has(id)) continue;
                const position = (item && typeof item === 'object' && item.position != null) ? item.position : (i + 1);
                await publication.addAuthor(id, { through: { position }, transaction: t });
            }
        }
        if (keywordIds && keywordIds.length) {
            const keywords = await Keyword.findAll({where: {id: keywordIds}, transaction: t});
            await publication.setKeywords(keywords, {transaction: t});
        }
        await t.commit();
        return publication;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

// 获取所有论文（分页排序筛选可扩展）
const getAllPublications = async ({page = 1, pageSize = 10, sortBy = 'year', sortOrder = 'DESC'}) => {
    const offset = (page - 1) * pageSize;
    const result = await Publication.findAndCountAll({
        distinct: true,
        limit: pageSize,
        offset,
        order: [
            [sortBy, sortOrder],
            [Author, PublicationAuthor, 'position', 'ASC']
        ],
        include: [
            {model: Venue},
            {model: PublicationType},
            {model: ResearchCategory},
            {model: Author, through: {attributes: ['position']}},
            {model: Keyword, through: {attributes: []}}
        ]
    });
    return {
        totalItems: result.count,
        items: result.rows,
        totalPages: Math.ceil(result.count / pageSize),
        currentPage: page
    };
};

// 获取单个论文详情
const getPublicationById = async (id) => {
    return await Publication.findByPk(id, {
        include: [
            { model: Venue },
            { model: PublicationType },
            { model: ResearchCategory },
            { model: Author, through: { attributes: ['position'] } },
            { model: Keyword, through: { attributes: [] } }
        ],
        order: [[Author, PublicationAuthor, 'position', 'ASC']]
    });
};

// 更新论文
const updatePublication = async (id, data) => {
    const t = await sequelize.transaction();
    try {
        const publication = await Publication.findByPk(id, {transaction: t});
        if (!publication) throw new Error('Publication not found');

        const {
            venueId,
            typeId = data.publicationTypeId,
            categoryId = data.researchCategoryId,
            authorIds = data.authors,
            keywordIds = data.keywords,
            ...rest
        } = data;

        const payloadUpdate = { ...rest };
        if (payloadUpdate.doi === '') payloadUpdate.doi = null;
        if (payloadUpdate.pdfUrl === '') payloadUpdate.pdfUrl = null;
        if (payloadUpdate.codeUrl === '') payloadUpdate.codeUrl = null;
        await publication.update(payloadUpdate, {transaction: t});

        if (venueId !== undefined) {
            const venue = await Venue.findByPk(venueId, {transaction: t});
            await publication.setVenue(venue, {transaction: t});
        }
        if (typeId !== undefined) {
            const type = await PublicationType.findByPk(typeId, {transaction: t});
            await publication.setPublicationType(type, {transaction: t});
        }
        if (categoryId !== undefined) {
            const category = await ResearchCategory.findByPk(categoryId, {transaction: t});
            await publication.setResearchCategory(category, {transaction: t});
        }
        if (authorIds !== undefined) {
            await publication.setAuthors([], { transaction: t });
            const flatIds = authorIds
                .map(a => (a && typeof a === 'object') ? (a.id ?? a.authorId) : a)
                .filter(id => id != null);
            const existing = await Author.findAll({ where: { id: flatIds }, transaction: t });
            const existingSet = new Set(existing.map(a => a.id));
            for (let i = 0; i < authorIds.length; i++) {
                const item = authorIds[i];
                const id = (item && typeof item === 'object') ? (item.id ?? item.authorId) : item;
                if (id == null || !existingSet.has(id)) continue;
                const position = (item && typeof item === 'object' && item.position != null) ? item.position : (i + 1);
                await publication.addAuthor(id, { through: { position }, transaction: t });
            }
        }
        if (keywordIds) {
            const keywords = await Keyword.findAll({where: {id: keywordIds}, transaction: t});
            await publication.setKeywords(keywords, {transaction: t});
        }
        await t.commit();
        return publication;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

// 删除论文
const deletePublication = async (id) => {
    const publication = await Publication.findByPk(id);
    if (!publication) throw new Error('Publication not found');
    return await publication.destroy();
};

// ---- Sub entity CRUD helpers ----
const createAuthor = async (data) => Author.create(data);
const createVenue = async (data) => Venue.create(data);
const createType = async (data) => PublicationType.create(data);
const createCategory = async (data) => ResearchCategory.create(data);
const createKeyword = async (data) => Keyword.create(data);

const updateAuthor = async (id, data) => {
    const a = await Author.findByPk(id);
    if (!a) throw new Error('Author not found');
    return a.update(data);
};
const updateVenue = async (id, data) => {
    const v = await Venue.findByPk(id);
    if (!v) throw new Error('Venue not found');
    return v.update(data);
};
const updateType = async (id, data) => {
    const t = await PublicationType.findByPk(id);
    if (!t) throw new Error('Type not found');
    return t.update(data);
};
const updateCategory = async (id, data) => {
    const c = await ResearchCategory.findByPk(id);
    if (!c) throw new Error('Category not found');
    return c.update(data);
};
const updateKeyword = async (id, data) => {
    const k = await Keyword.findByPk(id);
    if (!k) throw new Error('Keyword not found');
    return k.update(data);
};

const deleteAuthor = async (id) => {
    const a = await Author.findByPk(id);
    if (!a) throw new Error('Author not found');
    return a.destroy();
};
const deleteVenue = async (id) => {
    const v = await Venue.findByPk(id);
    if (!v) throw new Error('Venue not found');
    return v.destroy();
};
const deleteType = async (id) => {
    const t = await PublicationType.findByPk(id);
    if (!t) throw new Error('Type not found');
    return t.destroy();
};
const deleteCategory = async (id) => {
    const c = await ResearchCategory.findByPk(id);
    if (!c) throw new Error('Category not found');
    return c.destroy();
};
const deleteKeyword = async (id) => {
    const k = await Keyword.findByPk(id);
    if (!k) throw new Error('Keyword not found');
    return k.destroy();
};

const getAuthors = async () => Author.findAll({order: [['name', 'ASC']]});
const getVenues = async () => Venue.findAll({order: [['name', 'ASC']]});
const getTypes = async () => PublicationType.findAll({order: [['name', 'ASC']]});
const getCategories = async () => ResearchCategory.findAll({order: [['name', 'ASC']]});
const getKeywords = async () => Keyword.findAll({order: [['name', 'ASC']]});

module.exports = {
    createPublication,
    getAllPublications,
    getPublicationById,
    updatePublication,
    deletePublication,
    createAuthor,
    createVenue,
    createType,
    createCategory,
    createKeyword,
    updateAuthor,
    updateVenue,
    updateType,
    updateCategory,
    updateKeyword,
    deleteAuthor,
    deleteVenue,
    deleteType,
    deleteCategory,
    deleteKeyword,
    getAuthors,
    getVenues,
    getTypes,
    getCategories,
    getKeywords
};