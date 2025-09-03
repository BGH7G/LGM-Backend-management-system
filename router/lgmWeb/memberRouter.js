const express = require('express');
const router = express.Router();
const imagesUpload = require('../../util/multerKits/imageMulter');
const {verifyToken, optionalToken} = require('../../util/JWT');
const authorize = require('../../util/authorize');
const memberController = require("../../controller/lgmWeb/memberController");

// POST /member - 创建一个新成员
router.post('/', verifyToken(true), authorize('admin'), imagesUpload.single('avatar'), memberController.create)
    .post('/roles', verifyToken(true), authorize('admin'), memberController.createRole)
    .post('/expertises', verifyToken(true), authorize('admin'), memberController.createExpertise)
    .put('/:id', verifyToken(true), authorize('admin'), imagesUpload.single('avatar'), memberController.update)
    .put('/roles/:id', verifyToken(true), authorize('admin'), memberController.updateRole)
    .put('/expertises/:id', verifyToken(true), authorize('admin'), memberController.updateExpertise)
    .delete('/:id', verifyToken(true), authorize('admin'), memberController.delete)
    .delete('/roles/:id', verifyToken(true), authorize('admin'), memberController.deleteRole)
    .delete('/expertises/:id', verifyToken(true), authorize('admin'), memberController.deleteExpertise);

// GET /member - 获取所有成员（支持分页和排序）
router.get('/', optionalToken(), memberController.getAll)
    .get('/roles', optionalToken(), memberController.getRoles)
    .get('/expertises', optionalToken(), memberController.getExpertises);

module.exports = router;
