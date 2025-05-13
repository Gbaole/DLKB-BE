const express = require("express");
const uploadFile = require("../controllers/User/upload.controller");
const router = express.Router();

router.post("/upload", uploadFile.uploadFile);

module.exports = router;
