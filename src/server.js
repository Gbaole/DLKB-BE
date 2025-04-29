const express = require('express');
const bodyParser = require('body-parser');
const viewEngine = require('./config/viewEngine');
const initWebRoutes = require('./route/web');
const userRouter = require('./route/userRouter');
const doctorRouter = require('./route/doctorRouter');
const uploadRouter = require('./route/uploadRouter');
const cauhoiRouter = require('./route/cauHoiRouter');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Doctor = require('./model/Doctor');
const cron = require('node-cron');
// const moment = require('moment');
import moment from 'moment-timezone';
const KhamBenh = require('./model/KhamBenh');

require("dotenv").config();

let app = express();
let port = process.env.PORT || 6969;
const hostname = process.env.HOST_NAME;

connectDB();

// Cài đặt CORS
// app.use(
//     cors({
//       origin: "http://localhost:3000", // Thay bằng domain của frontend
//       credentials: true,
//     })
// );
const allowedOrigins = [
    'http://localhost:3000', // Local development
    'http://localhost:3002', // Local development
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) { // Dùng includes thay cho indexOf
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.options('*', cors()); // Enable preflight requests for all routes



// Config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Đặt thư mục public/uploads làm public để có thể truy cập
app.use('/uploads', express.static(path.join(__dirname, './public/uploads')));


// Config app
viewEngine(app);
// Định nghĩa các route cho API
app.use("/api/users", userRouter);
app.use("/api/doctor", doctorRouter);
// Sử dụng uploadRouter
app.use("/api/doctor", uploadRouter); // Đặt đường dẫn cho upload
app.use("/api/cauhoi", cauhoiRouter); // Đặt đường dẫn cho upload


// Hàm cron job xóa lịch quá hạn
cron.schedule("*/10 * * * * *", async () => {
    try {
        
        // const today = new Date().toLocaleDateString("en-CA");
        const today = moment().tz("Asia/Ho_Chi_Minh")
        const tenGio = today.format("HH:mm")
        console.log("today: ", today);
        console.log("tenGio: ", tenGio);

        // Xóa các lịch thỏa mãn điều kiện
        const result = await KhamBenh.deleteMany({
            ngayKhamBenh: { $lt: today.format("DD/MM/YYYY") },  // Ngày hẹn khám bệnh nhỏ hơn hôm nay
            trangThaiXacNhan: false,       // Chưa được xác nhận
            // tenGioKham: { $lt: `${tenGio}` }     // nếu giờ hẹn nhỏ hơn giờ hiện tại
        });

        console.log(`Đã xóa ${result.deletedCount} lịch khám bệnh quá hạn.`);
    } catch (err) {
        console.error("Có lỗi xảy ra khi xóa lịch khám bệnh:", err);
    }
});

// cron.schedule("*/10 * * * * *", async () => {
//     try {
//         const today = moment()
//         const tenGio = today.format("HH:mm"); // Giờ hiện tại
//         console.log("today: ", today);
//         console.log("tenGio: ", tenGio);

//         // Lấy tất cả các bản ghi chưa xác nhận
//         const records = await KhamBenh.find({ trangThaiXacNhan: false });

//         for (const record of records) {
//             const [startTime, endTime] = record.tenGioKham.split(" - "); // Phân tách giờ bắt đầu và kết thúc
//             console.log(`Start: ${startTime}, End: ${endTime}`);

//             // So sánh giờ bắt đầu và giờ kết thúc với giờ hiện tại
//             if (moment(tenGio, "HH:mm").isAfter(moment(startTime, "HH:mm")) && moment(tenGio, "HH:mm").isAfter(moment(endTime, "HH:mm"))) {
//                 // Xóa bản ghi nếu cả hai điều kiện đều thỏa mãn
//                 await KhamBenh.deleteOne({ _id: record._id });
//                 console.log(`Đã xóa lịch khám bệnh ${record.tenGioKham} vì đã quá hạn.`);
//             }
//         }

//     } catch (err) {
//         console.error("Có lỗi xảy ra khi xóa lịch khám bệnh:", err);
//     }
// });

// Hoặc sử dụng setInterval để kiểm tra thường xuyên
setInterval(async () => {
    try {
        const doctors = await Doctor.find();

        for (const doctor of doctors) {
            doctor.thoiGianKham = doctor.thoiGianKham.filter(slot => moment(slot.date).isSameOrAfter(moment(), 'day'));
            await doctor.save();
        }
        console.log('Đã tự động xóa các lịch trình cũ thành công!');
    } catch (error) {
        console.error('Có lỗi xảy ra khi xóa lịch trình cũ:', error);
    }
}, 1000 * 60 * 1); // 1 phút


app.listen(port, () => {
    console.log("backend nodejs is running on the port:", port, `\n http://localhost:${port}`);
});
