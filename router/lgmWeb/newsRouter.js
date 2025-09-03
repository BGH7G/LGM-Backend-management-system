const express = require('express');
const router = express.Router();
const newsController = require('../../controller/lgmWeb/newsController');
const imagesUpload = require('../../util/multerKits/imageMulter');
const {verifyToken, optionalToken} = require('../../util/JWT');
const authorize = require('../../util/authorize');

router
    .get('/', optionalToken(), newsController.get)
    .get('/categories', optionalToken(), newsController.getCategories)
    .get('/tags', optionalToken(), newsController.getTags)
    .get('/:id', optionalToken(), newsController.getById) // 必须放在最后！！！！！
    .post('/', verifyToken(true), authorize('admin'), imagesUpload.single('cover'), newsController.create)
    .post('/categories', verifyToken(true), authorize('admin'), newsController.createCategory)
    .post('/tags', verifyToken(true), authorize('admin'), newsController.createTag)
    .post('/:id/like', optionalToken(), newsController.like)
    .put('/:id', verifyToken(true), authorize('admin'), imagesUpload.single('cover'), newsController.update)
    .put('/categories/:id', verifyToken(true), authorize('admin'), newsController.updateCategory)
    .put('/tags/:id', verifyToken(true), authorize('admin'), newsController.updateTag)
    .delete('/:id', verifyToken(true), authorize('admin'), newsController.delete)
    .delete('/categories/:id', verifyToken(true), authorize('admin'), newsController.deleteCategory)
    .delete('/tags/:id', verifyToken(true), authorize('admin'), newsController.deleteTag)


module.exports = router;