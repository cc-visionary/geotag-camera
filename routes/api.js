const express = require('express');
const router = express.Router();

const ImageController = require('../controllers/ImageController');

// Images API
router.get('/images', ImageController.getAllImages);
router.post('/images/add', ImageController.addImage);

module.exports = router;