const express = require('express');
const datasheetController = require('../controller/datasheetController');
const { verifyToken } = require('../util/JWT');
const authorize = require('../util/authorize');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Create a new experiment
router.post('/experiment', verifyToken(true), datasheetController.createExperiment);

// Get all experiments (supports search by name and creator)
router.get('/experiments', verifyToken(true), datasheetController.getExperiments);

// Delete an experiment (cascade delete)
router.delete('/experiment/:experimentId', verifyToken(true), authorize('admin'), datasheetController.deleteExperiment);

// Add column definitions to an experiment
router.post('/experiment/:experimentId/columns', verifyToken(true), datasheetController.addColumns);

// Update a column definition
router.put('/experiment/:experimentId/column/:columnId', verifyToken(true), datasheetController.updateColumn);

// Delete a column definition
router.delete('/experiment/:experimentId/column/:columnId', verifyToken(true), authorize('admin'), datasheetController.deleteColumn);

// Get experiment details (including columns)
router.get('/experiment/:experimentId', verifyToken(true), datasheetController.getExperiment);

// Batch import data (JSON array)
router.post('/experiment/:experimentId/data/batch-import', verifyToken(true), datasheetController.batchImportData);

// Batch delete data
router.post('/experiment/:experimentId/data/batch-delete', verifyToken(true), datasheetController.batchDeleteData);

// Add data to an experiment

router.post('/experiment/:experimentId/data', verifyToken(true), datasheetController.addData);

router.post('/experiment/:experimentId/import-csv', verifyToken(true), upload.single('file'), datasheetController.importDataFromCSV);

// Get data from an experiment (supports pagination and filtering)
router.get('/experiment/:experimentId/data', verifyToken(true), datasheetController.getData);

// Export data (CSV)
router.get('/experiment/:experimentId/data/export', verifyToken(true), datasheetController.exportData);

// Update data in an experiment
router.put('/experiment/:experimentId/data/:dataId', verifyToken(true), datasheetController.updateData);

// Delete data from an experiment
router.delete('/experiment/:experimentId/data/:dataId', verifyToken(true), authorize('admin'), datasheetController.deleteData);

module.exports = router;