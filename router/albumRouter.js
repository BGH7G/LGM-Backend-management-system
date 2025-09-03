const express = require("express");
const router = express.Router();
const albumController = require('../controller/albumController');
const imagesUpload = require('../util/multerKits/imageMulter');
const {verifyToken} = require('../util/JWT');
const authorize = require("../util/authorize");

router
    .get('/', verifyToken(true), albumController.get)
    .get('/:id', verifyToken(true), albumController.getOne)
    .put('/editAlbum/:id', verifyToken(true), imagesUpload.single('cover'), albumController.edit)
    .post('/addAlbum', verifyToken(true), imagesUpload.single('cover'), albumController.post)
    .delete('/deleteAlbum/:id', verifyToken(true), authorize('admin'), albumController.delete)

module.exports = router;
