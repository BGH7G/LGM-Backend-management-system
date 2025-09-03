const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const imagesUpload = require('../util/multerKits/imageMulter');
const {verifyToken} = require('../util/JWT');

router
    .post('/register', userController.register)
    .post('/login', userController.login)
    .put('/edit', verifyToken(true), imagesUpload.single('avatar'), userController.edit)

module.exports = router;