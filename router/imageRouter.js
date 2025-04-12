const express = require('express');
const imageController = require('../controller/imageController');
const imageMulter = require('../util/multerKits/imageMulter');
const {verifyToken} = require('../util/JWT');
const router = express.Router();

router
    .get('/', verifyToken(true), imageController.get)
    .post('/addImage', verifyToken(true), imageMulter.array('images', 5), imageController.post)
    .delete('/deleteImage/:id', verifyToken(true), imageController.delete)

module.exports = router;