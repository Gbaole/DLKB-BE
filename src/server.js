const express = require("express");
const bodyParser = require("body-parser");
const viewEngine = require("./config/viewEngine");
const userRouter = require("./route/userRouter");
const doctorRouter = require("./route/doctorRouter");
const uploadRouter = require("./route/uploadRouter");
const cauhoiRouter = require("./route/cauHoiRouter");
const connectDB = require("./config/connectDB");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Doctor = require("./model/Doctor");
const cron = require("node-cron");
const moment = require("moment");
const KhamBenh = require("./model/KhamBenh");

require("dotenv").config();

let app = express();
let port = process.env.PORT || 6969;

connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
  "https://dlkb-fe-customer.vercel.app",
  "https://dlkb-fe-doctor.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.options("*", cors()); // Enable preflight requests for all routes

// Config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));

// Config app
viewEngine(app);

//Route
//User
app.use("/api/users", userRouter);

//Doctor
app.use("/api/doctor", doctorRouter);

//Upload
app.use("/api/doctor", uploadRouter);

//cauhoi
app.use("/api/cauhoi", cauhoiRouter);

// Hàm cron job xóa lịch quá hạn
cron.schedule("*/10 * * * * *", async () => {
  try {
    const today = moment().tz("Asia/Ho_Chi_Minh");
    const tenGio = today.format("HH:mm");
    console.log("today: ", today);
    console.log("tenGio: ", tenGio);

    // Xóa các lịch thỏa mãn điều kiện
    const result = await KhamBenh.deleteMany({
      ngayKhamBenh: { $lt: today.format("DD/MM/YYYY") }, // Ngày hẹn khám bệnh nhỏ hơn hôm nay
      trangThaiXacNhan: false, // Chưa được xác nhận
    });

    console.log(`Đã xóa ${result.deletedCount} lịch khám bệnh quá hạn.`);
  } catch (err) {
    console.error("Có lỗi xảy ra khi xóa lịch khám bệnh:", err);
  }
});

setInterval(async () => {
  try {
    const doctors = await Doctor.find();

    for (const doctor of doctors) {
      doctor.thoiGianKham = doctor.thoiGianKham.filter((slot) =>
        moment(slot.date).isSameOrAfter(moment(), "day")
      );
      await doctor.save();
    }
    console.log("Đã tự động xóa các lịch trình cũ thành công!");
  } catch (error) {
    console.error("Có lỗi xảy ra khi xóa lịch trình cũ:", error);
  }
}, 1000 * 60 * 1); // 1 phút

app.listen(port, () => {
  console.log(
    "backend nodejs is running on the port:",
    port,
    `\n http://localhost:${port}`
  );
});
