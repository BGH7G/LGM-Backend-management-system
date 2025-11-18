const express = require('express');
const router = express.Router();
const codeShareController = require('../../controller/lgmWeb/codeShareController');
const imagesUpload = require('../../util/multerKits/imageMulter');
const codeUpload = require('../../util/multerKits/codeMulter');
const { verifyToken, optionalToken } = require('../../util/JWT');
const authorize = require('../../util/authorize');

// 配置多文件上传：codeFile（单个代码文件）+ images（多个预览图）
const uploadFields = [
    { name: 'codeFile', maxCount: 1 },
    { name: 'images', maxCount: 10 }
];

router
    // 查询列表和详情
    .get('/', optionalToken(), codeShareController.get)
    .get('/languages', optionalToken(), codeShareController.getLanguages)
    .get('/omics-types', optionalToken(), codeShareController.getOmicsTypes)
    .get('/:id/download', optionalToken(), codeShareController.downloadFile) // 下载文件
    .get('/:id/download-logs', verifyToken(true), authorize('admin'), codeShareController.getDownloadLogs)
    .get('/:id', optionalToken(), codeShareController.getById) // 必须放在最后！！！！！
    
    // 创建和更新
    .post('/', verifyToken(true), authorize('admin'), codeUpload.fields(uploadFields), codeShareController.create)
    .put('/:id', verifyToken(true), authorize('admin'), codeUpload.fields(uploadFields), codeShareController.update)
    
    // 删除
    .delete('/:id', verifyToken(true), authorize('admin'), codeShareController.delete)
    .delete('/images/:imageId', verifyToken(true), authorize('admin'), codeShareController.deleteImage)
    
    // 封面图设置
    .put('/:id/cover/:imageId', verifyToken(true), authorize('admin'), codeShareController.setCover)
    
    // 下载记录
    .post('/:id/download', optionalToken(), codeShareController.download);

module.exports = router;