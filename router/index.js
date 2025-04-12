const express = require('express');
const router = express.Router();

router.use('/sample', require('./sampleRouter'))
router.use('/user', require('./userRouter'))
router.use('/image', require('./imageRouter'))
router.use('/huSheep', require('./experimentalData/huSheepRouter'))

module.exports = router;