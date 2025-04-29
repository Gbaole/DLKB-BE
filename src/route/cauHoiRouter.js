const express = require("express");
import cauHoi from '../controllers/CauHoi/cau.hoi.controller';
const router = express.Router();

router.post("/create-cau-hoi", cauHoi.createCauHoi );

router.get("/get-cau-hoi", cauHoi.getCauHoi );

router.get("/get-all-cau-hoi", cauHoi.getAllCauHoi );

router.put("/tra-loi-cau-hoi", cauHoi.traLoiCauHoi );

module.exports = router;