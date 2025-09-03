const express = require('express');
const huSheepController = require('../../controller/experimentalData/huSheepController');
const imageMulter = require('../../util/multerKits/imageMulter');
const fileMulter = require('../../util/multerKits/fileMulter');
const authorize = require('../../util/authorize');
const {verifyToken} = require('../../util/JWT');
const router = express.Router();

router
    .get('/', verifyToken(true), huSheepController.getAll)
    .get('/sheep-indexes', verifyToken(true), huSheepController.getSheepIndexesFlat)
    // New routes for selective data fetching
    .get('/locations', verifyToken(true), huSheepController.getLocations)
    .get('/latest-indexes', verifyToken(true), huSheepController.getLatestIndexes)
    .get('/age-milestones', verifyToken(true), huSheepController.getAgeMilestones)
    .get('/:id', verifyToken(true), huSheepController.getSheep)
    .post('/submit/sheep', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.sheepInfoPost)
    .post('/submit/ageMilestone', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.ageInfoPost)
    .post('/submit/index', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.indexInfoPost)
    // 批量导入与模板下载
    .post('/import/index', verifyToken(true), authorize('admin'), fileMulter.single('file'), huSheepController.indexImport)
    .get('/template/index', verifyToken(true), authorize('admin'), huSheepController.indexTemplate)
    .put('/update/:id', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.sheepUpdate)
    .put('/update/index/:id', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.sheepIndexUpdate)
    .put('/update/location/:id', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.locationUpdate)
    .put('/update/ageMilestone/:id', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.ageMilestoneUpdate)
    .delete('/delete/:id', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.sheepDelete)
    .delete('/delete', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.batchSheepDelete)
    .delete('/delete/index/:id', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.sheepIndexDelete)
    .delete('/delete/location/:id', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.locationDelete)
    .delete('/delete/ageMilestone/:id', verifyToken(true), authorize('admin'), imageMulter.none(), huSheepController.ageMilestoneDelete)

module.exports = router;