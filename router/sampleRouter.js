const express = require('express');
const sampleController = require('../controller/sampleController');
const {verifyToken} = require("../util/JWT");
const authorize = require('../util/authorize');
const router = express.Router();

router
    .get('/',verifyToken(true), sampleController.get)
    .post('/sampleAdd',verifyToken(true), sampleController.add)
    .put('/sampleEdit/:id',verifyToken(true), sampleController.edit)
    .delete('/sampleDelete/:id',verifyToken(true), sampleController.delete)

module.exports = router;