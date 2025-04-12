const express = require('express');
const huSheepController = require('../../controller/experimentalData/huSheepController');
const imageMulter = require('../../util/multerKits/imageMulter');
const {verifyToken} = require('../../util/JWT');
const router = express.Router();

router
    .get('/', verifyToken(true), huSheepController.getAll)
    .get('/:id', verifyToken(true), huSheepController.getSheep)
    .post('/submit/sheep', verifyToken(true),imageMulter.none(),huSheepController.sheepInfoPost)
    .post('/submit/ageMilestone', verifyToken(true),imageMulter.none(),huSheepController.ageInfoPost)
    .post('/submit/index', verifyToken(true),imageMulter.none(),huSheepController.indexInfoPost)
    .put('/update/:id', verifyToken(true),imageMulter.none(),huSheepController.sheepUpdate)
    .put('/update/index/:id', verifyToken(true),imageMulter.none(),huSheepController.sheepIndexUpdate)
    .put('/update/location/:id', verifyToken(true),imageMulter.none(),huSheepController.locationUpdate)
    .put('/update/ageMilestone/:id', verifyToken(true),imageMulter.none(),huSheepController.ageMilestoneUpdate)
    .delete('/delete/:id', verifyToken(true),imageMulter.none(),huSheepController.sheepDelete)
    .delete('/delete', verifyToken(true),imageMulter.none(),huSheepController.batchSheepDelete)
    .delete('/delete/index/:id', verifyToken(true),imageMulter.none(),huSheepController.sheepIndexDelete)
    .delete('/delete/location/:id', verifyToken(true),imageMulter.none(),huSheepController.locationDelete)
    .delete('/delete/ageMilestone/:id', verifyToken(true),imageMulter.none(),huSheepController.ageMilestoneDelete)

module.exports = router;