const express = require("express");
const router = express.Router();
const cauHoi = require("../controllers/CauHoi/cau.hoi.controller");
router.post("/create-cau-hoi", cauHoi.createCauHoi);

router.get("/get-cau-hoi", cauHoi.getCauHoi);

router.get("/get-all-cau-hoi", cauHoi.getAllCauHoi);

router.put("/tra-loi-cau-hoi", cauHoi.traLoiCauHoi);

module.exports = router;
