const express = require('express');
const router = express.Router();
const {verifyToken} = require('../util/JWT');
const locationController = require('../controller/locationController');

router.
    get('/', verifyToken(true), locationController.get);

module.exports = router;
