const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const imageMulter = require('../util/multerKits/imageMulter');
const {verifyToken} = require('../util/JWT');

router
    .post('/register', userController.register)
    .get('/login', userController.login)
    .put('/edit', verifyToken(true), imageMulter.single('avatar'), userController.edit)

module.exports = router;