const express = require("express");
const userDoctor = require("../controllers/User/user.doctor.controller");
const appointmentController = require("../controllers/PhongKham/appointment.controller");
const clinicController = require("../controllers/PhongKham/clinic.controller");
const timeController = require("../controllers/PhongKham/time.controller");
const revenueController = require("../controllers/PhongKham/revenue.controller");

const KhamBenh = require("../model/KhamBenh");
const {
  IpnFailChecksum,
  VNPay,
  IpnOrderNotFound,
  IpnInvalidAmount,
  InpOrderAlreadyConfirmed,
  IpnSuccess,
  IpnUnknownError,
  ignoreLogger,
  VerifyReturnUrl,
} = require("vnpay");
const router = express.Router();

// User.doctor controller
// API để lấy thời gian khám của bác sĩ theo ngày
router.get("/get-time-slots", userDoctor.getTimeSlotsByDoctorAndDate);
// them thoi gian kham benh
router.post("/add-time", userDoctor.addTimeKhamBenhDoctor);
// xóa lịch trình cũ đi
router.post("/delete-old-time-slots", userDoctor.deleteOldTimeSlots);
// tìm ra doctor để hiển thị chi tiết
router.get("/view-doctor", userDoctor.fetchDoctorById);
// hiển thị info doctor kèm theo thgian khám cho page đặt lịch khám
router.get("/page-dat-lich-kham", userDoctor.fetchDoctorByNgayGio);
// get all doctor
router.get("/fetch-all-doctor", userDoctor.fetchAllDoctor);
// find doctor by id
router.get("/fetch-doctor-by-id", userDoctor.fetchAllDoctorById);
// route create doctor
router.post("/create-doctor", userDoctor.createDoctor);
// route update doctor
router.put("/update-doctor", userDoctor.updateDoctor);
// route delete doctor
router.delete("/delete-doctor/:id", userDoctor.deleteDoctor);

// tim bac si thong qua id chuyen khoa
router.get("/doctor-chuyen-khoa", userDoctor.fetchDoctorByChuyenKhoa);
router.get("/fetch-phong-kham-by-id", userDoctor.fetchPhongKhamByID);
router.get("/doctor-phong-kham", userDoctor.fetchDoctorByPhongKham);
router.put("/edit-thongtinkham", userDoctor.updateTTBN);

//Clinic controller
// Route Chuyên khoa
router.get("/fetch-all-chuyen-khoa", clinicController.fetchAllChuyenKhoa);
router.get("/fetch-chuyen-khoa-by-id", clinicController.fetchChuyenKhoaByID);
router.post("/create-chuyen-khoa", clinicController.createChuyenKhoa);
router.delete("/delete-chuyen-khoa/:id", clinicController.deleteChuyenKhoa);
router.put("/update-chuyen-khoa", clinicController.updateChuyenKhoa);

//Route Chức vụ
router.get("/fetch-all-chuc-vu", clinicController.fetchAllChucVu);
router.post("/create-chuc-vu", clinicController.createChucVu);
router.put("/update-chuc-vu", clinicController.updateChucVu);
router.delete("/delete-chuc-vu/:id", clinicController.deleteChucVu);

//Route phòng khám
router.get("/fetch-all-phong-kham", clinicController.fetchAllPhongKham);
router.post("/create-phong-kham", clinicController.createPhongKham);
router.delete("/delete-phong-kham/:id", clinicController.deletePhongKham);
router.put("/update-phong-kham", clinicController.updatePhongKham);

//Time controller
// fetch all thoi gian gio
router.get("/fetch-all-time-gio", timeController.fetchAllThoiGianGio);

// Appointment controller
// Route dat lich kham
router.post("/dat-lich-kham", appointmentController.datLichKham);
router.post("/dat-lich-kham-vnpay", appointmentController.datLichKhamTTVNPay);
router.get("/lich-hen", appointmentController.getLichHen);
router.post("/huy-order", appointmentController.handleHuyOrder);
router.get("/find-all-order", appointmentController.findAllLichHen);
router.get(
  "/find-all-order-by-doctor",
  appointmentController.findAllLichHenByDoctor
);
router.delete("/delete-lich-hen/:id", appointmentController.deleteLichHen);
router.put("/edit-xacnhan-lich", appointmentController.xacNhanLich);

//Revenue Controller
// Route doanh thu
router.post("/thong-ke", revenueController.doanhThu);

router.get("/vnpay_return", async (req, res) => {
  const vnp_TxnRef = req.query.vnp_TxnRef;
  const vnp_ResponseCode = req.query.vnp_ResponseCode;

  console.log("vnp_TxnRef: ", vnp_TxnRef);

  if (vnp_ResponseCode === "00") {
    // '00' là mã thành công
    // So sánh vnp_TxnRef với _id trong model Order
    const order = await KhamBenh.findById(vnp_TxnRef);
    if (order) {
      // Cập nhật trạng thái đơn hàng
      order.trangThaiXacNhan = true;
      order.trangThaiThanhToan = true;
      await order.save();

      res.render("tbThanhToan.ejs");
    } else {
      res.status(404).send("Không tìm thấy đơn hàng");
    }
  } else {
    res.send(
      "Thanh toán không thành công, đã đặt đơn nhưng chưa được thanh toán"
    );
  }
});

module.exports = router;
