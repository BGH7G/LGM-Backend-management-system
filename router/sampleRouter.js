const express = require('express');
const sampleController = require('../controller/sampleController');
const router = express.Router();

router
    .get('/', sampleController.get)
    .post('/sampleAdd', sampleController.add)
    .put('/sampleEdit/:id', sampleController.edit)
    .delete('/sampleDelete/:id', sampleController.delete)

module.exports = router;