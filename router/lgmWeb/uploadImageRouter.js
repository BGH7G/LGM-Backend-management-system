const express = require('express');
const editorImageMulter = require('../../util/multerKits/editorImageMulter');
const {verifyToken} = require('../../util/JWT');
const {uploadImage} = require('../../controller/lgmWeb/uploadImageController');
const router = express.Router();

// 如需鉴权，加 authorize 中间件
router.post('/image', verifyToken(true), editorImageMulter.single('images'), uploadImage);

module.exports = router;