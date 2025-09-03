const express = require('express');
const router = express.Router();
const publicationController = require('../../controller/lgmWeb/publicationController');
const imagesUpload = require('../../util/multerKits/imageMulter');
const {verifyToken, optionalToken} = require('../../util/JWT');
const authorize = require('../../util/authorize');

router
    // 创建
    .post('/', verifyToken(true), authorize('admin'), publicationController.create)
    .post('/authors', verifyToken(true), authorize('admin'), publicationController.createAuthor)
    .post('/venues', verifyToken(true), authorize('admin'), publicationController.createVenue)
    .post('/types', verifyToken(true), authorize('admin'), publicationController.createType)
    .post('/categories', verifyToken(true), authorize('admin'), publicationController.createCategory)
    .post('/keywords', verifyToken(true), authorize('admin'), publicationController.createKeyword)
    // 更新
    .put('/:id', verifyToken(true), authorize('admin'), publicationController.update)
    .put('/authors/:id', verifyToken(true), authorize('admin'), publicationController.updateAuthor)
    .put('/venues/:id', verifyToken(true), authorize('admin'), publicationController.updateVenue)
    .put('/types/:id', verifyToken(true), authorize('admin'), publicationController.updateType)
    .put('/categories/:id', verifyToken(true), authorize('admin'), publicationController.updateCategory)
    .put('/keywords/:id', verifyToken(true), authorize('admin'), publicationController.updateKeyword)
    // 删除
    .delete('/:id', verifyToken(true), authorize('admin'), publicationController.delete)
    .delete('/authors/:id', verifyToken(true), authorize('admin'), publicationController.deleteAuthor)
    .delete('/venues/:id', verifyToken(true), authorize('admin'), publicationController.deleteVenue)
    .delete('/types/:id', verifyToken(true), authorize('admin'), publicationController.deleteType)
    .delete('/categories/:id', verifyToken(true), authorize('admin'), publicationController.deleteCategory)
    .delete('/keywords/:id', verifyToken(true), authorize('admin'), publicationController.deleteKeyword)

    // 查询
    .get('/', optionalToken(), publicationController.getAll)
    .get('/authors', optionalToken(), publicationController.getAuthors)
    .get('/venues', optionalToken(), publicationController.getVenues)
    .get('/types', optionalToken(), publicationController.getTypes)
    .get('/categories', optionalToken(), publicationController.getCategories)
    .get('/keywords', optionalToken(), publicationController.getKeywords)
    .get('/:id', optionalToken(), publicationController.getById);

module.exports = router;