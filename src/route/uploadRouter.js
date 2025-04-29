// routes/uploadRoutes.js
const express = require('express');
import uploadFile from '../controllers/User/upload.controller';
const router = express.Router();

// Tạo route upload
router.post('/upload', uploadFile.uploadFile);

module.exports = router;
