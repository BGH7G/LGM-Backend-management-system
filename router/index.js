const express = require('express');
const router = express.Router();

router.use('/sample', require('./sampleRouter'))
router.use('/user', require('./userRouter'))
router.use('/activationCode', require('./activationCodeRouter'))
router.use('/image', require('./imageRouter'))
router.use('/huSheep', require('./experimentalData/huSheepRouter'))
router.use('/location', require('./locationRouter'))
router.use('/album', require('./albumRouter'))
router.use('/claim', require('./claimRouter'))
router.use('/news', require('./lgmWeb/newsRouter'))
router.use('/member', require('./lgmWeb/memberRouter'))
router.use('/publication', require('./lgmWeb/publicationRouter'))
router.use('/upload', require('./lgmWeb/uploadImageRouter'))


module.exports = router;