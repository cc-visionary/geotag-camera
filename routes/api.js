const express = require('express');
const router = express.Router();

const MetadataController = require('../controllers/MetadataController');
const S3Controller = require('../controllers/S3Controller');

// Metadatas API
router.get('/metadatas', MetadataController.getAllMetadatas);
router.post('/metadatas/add', MetadataController.addMetadata);

router.post('/s3/presigned_url', S3Controller.generatePreSignedPutUrl)

module.exports = router;