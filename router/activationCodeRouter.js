const express = require('express');
const router = express.Router();
const controller = require('../controller/activationCodeController');
const { verifyToken } = require('../util/JWT');
const authorize = require('../util/authorize');

router
  .post('/generate', verifyToken(true), authorize('admin'), controller.generate)
  .get('/', verifyToken(true), authorize('admin'), controller.list)
  .put('/:id/disable', verifyToken(true), authorize('admin'), controller.disable);

module.exports = router;
