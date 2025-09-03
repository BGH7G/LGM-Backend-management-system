const pubService = require('../../services/lgmWeb/publicationTransaction');

// GET /publications
exports.getAll = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const sortBy = req.query.sortBy || 'year';
        const sortOrder = (req.query.sortOrder || 'DESC').toUpperCase();
        const result = await pubService.getAllPublications({ page, pageSize, sortBy, sortOrder });
        res.status(200).json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve publications.', error: e.message });
    }
};

// GET /publications/:id
exports.getById = async (req, res) => {
    try {
        const pub = await pubService.getPublicationById(req.params.id);
        if (!pub) return res.status(404).json({ success: false, msg: 'Publication not found' });
        res.status(200).json({ success: true, data: pub });
    } catch (e){
        res.status(500).json({ success: false, msg: 'Failed to retrieve publication.', error: e.message });
    }
};

// POST /publications
exports.create = async (req, res) => {
    try {
        const pub = await pubService.createPublication(req.body);
        res.status(201).json({ success: true, data: pub });
    } catch (e) {
        res.status(500).json({ success: false, msg: 'Failed to create publication.', error: e.message });
    }
};

// PUT /publications/:id
exports.update = async (req, res) => {
    try {
        const pub = await pubService.updatePublication(req.params.id, req.body);
        res.status(200).json({ success: true, data: pub });
    } catch (e) {
        if (e.message === 'Publication not found') return res.status(404).json({ success: false, msg: e.message });
        res.status(500).json({ success: false, msg: 'Failed to update publication.', error: e.message });
    }
};

// DELETE /publications/:id
exports.delete = async (req, res) => {
    try {
        await pubService.deletePublication(req.params.id);
        res.status(204).end();
    } catch (e) {
        if (e.message === 'Publication not found') return res.status(404).json({ success: false, msg: e.message });
        res.status(500).json({ success: false, msg: 'Failed to delete publication.', error: e.message });
    }
};

// ---------- Sub resources ----------
const simpleCrud = (svcCreate, svcUpdate, svcDelete, svcGetAll, notFoundMsg) => ({
    create: async (req, res) => {
        try { const item = await svcCreate(req.body); res.status(201).json({ success: true, data: item }); }
        catch (e) { res.status(500).json({ success: false, msg: `Failed to create ${notFoundMsg}.`, error: e.message }); }
    },
    update: async (req, res) => {
        try { const item = await svcUpdate(req.params.id, req.body); res.status(200).json({ success: true, data: item }); }
        catch (e) { if (e.message.includes('not found')) return res.status(404).json({ success: false, msg: e.message }); res.status(500).json({ success: false, msg: `Failed to update ${notFoundMsg}.`, error: e.message }); }
    },
    delete: async (req, res) => {
        try { await svcDelete(req.params.id); res.status(204).end(); }
        catch (e) { if (e.message.includes('not found')) return res.status(404).json({ success: false, msg: e.message }); res.status(500).json({ success: false, msg: `Failed to delete ${notFoundMsg}.`, error: e.message }); }
    },
    getAll: async (req, res) => {
        try { const items = await svcGetAll(); res.status(200).json({ success: true, data: items }); }
        catch (e) { res.status(500).json({ success: false, msg: `Failed to retrieve ${notFoundMsg}.`, error: e.message }); }
    }
});

const authorHandlers = simpleCrud(pubService.createAuthor, pubService.updateAuthor, pubService.deleteAuthor, pubService.getAuthors, 'author');
const venueHandlers = simpleCrud(pubService.createVenue, pubService.updateVenue, pubService.deleteVenue, pubService.getVenues, 'venue');
const typeHandlers = simpleCrud(pubService.createType, pubService.updateType, pubService.deleteType, pubService.getTypes, 'type');
const categoryHandlers = simpleCrud(pubService.createCategory, pubService.updateCategory, pubService.deleteCategory, pubService.getCategories, 'category');
const keywordHandlers = simpleCrud(pubService.createKeyword, pubService.updateKeyword, pubService.deleteKeyword, pubService.getKeywords, 'keyword');

exports.createAuthor = authorHandlers.create;
exports.updateAuthor = authorHandlers.update;
exports.deleteAuthor = authorHandlers.delete;
exports.getAuthors = authorHandlers.getAll;

exports.createVenue = venueHandlers.create;
exports.updateVenue = venueHandlers.update;
exports.deleteVenue = venueHandlers.delete;
exports.getVenues = venueHandlers.getAll;

exports.createType = typeHandlers.create;
exports.updateType = typeHandlers.update;
exports.deleteType = typeHandlers.delete;
exports.getTypes = typeHandlers.getAll;

exports.createCategory = categoryHandlers.create;
exports.updateCategory = categoryHandlers.update;
exports.deleteCategory = categoryHandlers.delete;
exports.getCategories = categoryHandlers.getAll;

exports.createKeyword = keywordHandlers.create;
exports.updateKeyword = keywordHandlers.update;
exports.deleteKeyword = keywordHandlers.delete;
exports.getKeywords = keywordHandlers.getAll;