const express = require('express');
const imageController = require('../controller/imageController');
const imagesUpload = require('../util/multerKits/imageMulter');
const authorize = require('../util/authorize');
const {verifyToken} = require('../util/JWT');
const router = express.Router();

router
    .get('/:id', verifyToken(true), imageController.get)
    .post('/addImage', verifyToken(true), imagesUpload.array('images', 5), imageController.post)
    .delete('/deleteImage/:id', verifyToken(true), authorize('admin'), imageController.delete)

module.exports = router;