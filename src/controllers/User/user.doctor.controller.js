const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AccAdmin = require("../../model/AccAdmin");
const ChuyenKhoa = require("../../model/ChuyenKhoa");
const ChucVu = require("../../model/ChucVu");
const Role = require("../../model/Role");
const Doctor = require("../../model/Doctor");
const ThoiGianGio = require("../../model/ThoiGianGio");
const PhongKham = require("../../model/PhongKham");
const { VNPay, ProductCode, VnpLocale, ignoreLogger } = require("vnpay");
require("dotenv").config();
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
// Secret key cho JWT
const JWT_SECRET = process.env.JWT_SECRET;
// const moment = require('moment');
const moment = require("moment-timezone");
const KhamBenh = require("../../model/KhamBenh");

const nodemailer = require("nodemailer");

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const transporter = nodemailer.createTransport({
  service: "gmail", // Chọn dịch vụ email như Gmail
  auth: {
    user: "quanthqdev@gmail.com",
    pass: "jiotxdnucyulkxoh",
  },
});

// Hàm gửi email thông báo
const sendAppointmentEmail = async (
  email,
  patientName,
  nameDoctor,
  tenGioKham,
  ngayKhamBenh,
  giaKham,
  address,
  phone,
  lidokham,
  stringTrangThaiXacNhan,
  namePK,
  addressPK,
  sdtDoct,
  sdtPK
) => {
  const mailOptions = {
    from: "ADMIN", // Người gửi
    to: email, // Người nhận là email bệnh nhân
    subject: "Xác nhận lịch khám",
    html: `
            <h2>Thông tin lịch khám</h2>
            <table border="1" cellpadding="10">
                <tr>
                    <th>Thông tin bệnh nhân</th>
                    <th>Thông tin lịch khám</th>
                </tr>
                <tr>
                    <td><strong>Tên bệnh nhân:</strong> ${patientName}</td>
                    <td><strong>Ngày khám:</strong> ${ngayKhamBenh}</td>
                </tr>
                <tr>
                    <td><strong>Email:</strong> ${email}</td>
                    <td><strong>Giờ khám:</strong> ${tenGioKham}</td>
                </tr>
                <tr>
                    <td><strong>Số điện thoại:</strong> ${phone}</td>
                    <td>
                        <strong>Bác sĩ:</strong> ${nameDoctor} <br/>
                        <strong>Số điện thoại:</strong> ${sdtDoct}
                        </td>
                </tr>
                <tr>
                    <td><strong>Địa chỉ:</strong> ${address}</td>
                    <td><strong>Giá khám:</strong> ${formatCurrency(
                      giaKham
                    )}</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tên phòng khám:</strong> ${namePK} <br/>
                        <strong>Địa chỉ phòng khám:</strong> ${addressPK} <br/>
                        <strong>Số điện thoại phòng khám:</strong> ${sdtPK}
                        </td>
                </tr>
                <tr>
                    <td colspan="2"><strong>Lí do khám: </strong> ${lidokham}</td>
                </tr>
                <tr>
                    <td colspan="2"><strong>Trạng thái lịch hẹn: </strong> ${stringTrangThaiXacNhan}</td>
                </tr>
            </table>
            <p>Cảm ơn bạn đã đặt lịch khám tại chúng tôi. Chúng tôi sẽ thông báo trước ngày khám nếu có thay đổi.</p>
        `,
  };

  // Gửi email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email đã được gửi thành công!");
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
};

const sendAppointmentEmailHuyLich = async (
  email,
  patientName,
  nameDoctor,
  tenGioKham,
  ngayKhamBenh,
  giaKham,
  address,
  phone,
  lidokham,
  stringTrangThaiXacNhan,
  namePK,
  addressPK,
  sdtDoct,
  sdtPK
) => {
  const mailOptions = {
    from: "ADMIN", // Người gửi
    to: email, // Người nhận là email bệnh nhân
    subject: "Lịch khám đã bị hủy vì quá hạn hoặc hết lịch",
    html: `
            <h2>Thông tin lịch khám</h2>
            <table border="1" cellpadding="10">
                <tr>
                    <th>Thông tin bệnh nhân</th>
                    <th>Thông tin lịch khám</th>
                </tr>
                <tr>
                    <td><strong>Tên bệnh nhân:</strong> ${patientName}</td>
                    <td><strong>Ngày khám:</strong> ${ngayKhamBenh}</td>
                </tr>
                <tr>
                    <td><strong>Email:</strong> ${email}</td>
                    <td><strong>Giờ khám:</strong> ${tenGioKham}</td>
                </tr>
                <tr>
                    <td><strong>Số điện thoại:</strong> ${phone}</td>
                    <td>
                        <strong>Bác sĩ:</strong> ${nameDoctor} <br/>
                        <strong>Số điện thoại:</strong> ${sdtDoct}
                        </td>
                </tr>
                <tr>
                    <td><strong>Địa chỉ:</strong> ${address}</td>
                    <td><strong>Giá khám:</strong> ${formatCurrency(
                      giaKham
                    )}</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tên phòng khám:</strong> ${namePK} <br/>
                        <strong>Địa chỉ phòng khám:</strong> ${addressPK} <br/>
                        <strong>Số điện thoại phòng khám:</strong> ${sdtPK}
                        </td>
                </tr>
                <tr>
                    <td colspan="2"><strong>Lí do khám: </strong> ${lidokham}</td>
                </tr>               
            </table>
        `,
  };

  // Gửi email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email đã được gửi thành công!");
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
};

const sendAppointmentEmailBenhAn = async (
  email,
  patientName,
  nameDoctor,
  tenGioKham,
  ngayKhamBenh,
  giaKham,
  address,
  phone,
  lidokham,
  stringTrangThaiKham,
  benhAn,
  namePK,
  addressPK,
  sdtDoct,
  sdtPK
) => {
  const mailOptions = {
    from: "ADMIN", // Người gửi
    to: email, // Người nhận là email bệnh nhân
    subject: "Thông báo kết quả khám và bệnh án",
    html: `
            <h2>Thông tin lịch khám và bệnh án</h2>
            <table border="1" cellpadding="10">
                <tr>
                    <th>Thông tin bệnh nhân</th>
                    <th>Thông tin lịch khám</th>
                </tr>
                <tr>
                    <td><strong>Tên bệnh nhân:</strong> ${patientName}</td>
                    <td><strong>Ngày khám:</strong> ${ngayKhamBenh}</td>
                </tr>
                <tr>
                    <td><strong>Email:</strong> ${email}</td>
                    <td><strong>Giờ khám:</strong> ${tenGioKham}</td>
                </tr>
                <tr>
                    <td><strong>Số điện thoại:</strong> ${phone}</td>
                    <td>
                        <strong>Bác sĩ:</strong> ${nameDoctor} <br/>
                        <strong>Số điện thoại bác sĩ:</strong> ${sdtDoct}
                        </td>
                </tr>
                <tr>
                    <td><strong>Địa chỉ:</strong> ${address}</td>
                    <td><strong>Giá khám:</strong> ${formatCurrency(
                      giaKham
                    )}</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tên phòng khám:</strong> ${namePK} <br/>
                        <strong>Địa chỉ phòng khám:</strong> ${addressPK} <br/>
                        <strong>Số điện thoại phòng khám:</strong> ${sdtPK}
                        </td>
                </tr>
                <tr>
                    <td colspan="2"><strong>Lí do khám: </strong> ${lidokham}</td>
                </tr>
                <tr>
                    <td colspan="2"><strong>Trạng thái khám: </strong> <span style={{color: "green"}}>${stringTrangThaiKham}</span></td>
                </tr>
                <tr>
                    <td colspan="2">
                    <strong>Bệnh án:</strong> ${benhAn}
                    </td>
                </tr>
            </table>
            <p>Cảm ơn bạn đã sử dụng dịch vụ khám chữa bệnh của chúng tôi. Chúng tôi hy vọng bạn sẽ có kết quả tốt và sức khỏe ngày càng tốt hơn.</p>
        `,
  };

  // Gửi email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email đã được gửi thành công!");
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
};

const vnpay = new VNPay({
  tmnCode: "4WKUEION",
  secureSecret: "2ZPPJ91HOK6J7JE6G3CUNRPGWJXJ4369",
  vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
  hashAlgorithm: "SHA512", // tùy chọn

  /**
   * Sử dụng enableLog để bật/tắt logger
   * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
   */
  enableLog: true, // optional

  /**
   * Hàm `loggerFn` sẽ được gọi để ghi log
   * Mặc định, loggerFn sẽ ghi log ra console
   * Bạn có thể ghi đè loggerFn để ghi log ra nơi khác
   *
   * `ignoreLogger` là một hàm không làm gì cả
   */
  loggerFn: ignoreLogger, // optional
});

module.exports = {
  updateTTBN: async (req, res) => {
    try {
      let { _id, benhAn, trangThaiKham } = req.body;
      console.log("id: ", _id);

      // Cập nhật bệnh án và trạng thái khám
      let updatedAppointment = await KhamBenh.updateOne(
        { _id: _id },
        { benhAn, trangThaiKham, trangThaiThanhToan: true }
      );

      if (updatedAppointment) {
        console.log("Chỉnh sửa thành công thông tin khám");

        // Tìm thông tin bệnh nhân đã được cập nhật
        let appointment = await KhamBenh.findById(_id)
          .populate("_idDoctor _idTaiKhoan")
          .populate({
            path: "_idDoctor",
            populate: {
              path: "phongKhamId", // Populate thông tin phòng khám của bác sĩ
              model: "PhongKham",
            },
          });

        // Lấy thông tin cần thiết
        const patientName = appointment.patientName;
        const email = appointment.email;
        const tenGioKham = appointment.tenGioKham;
        const ngayKhamBenh = appointment.ngayKhamBenh;
        const giaKham = appointment.giaKham;
        const address = appointment.address;
        const phone = appointment.phone;
        const lidokham = appointment.lidokham;
        const nameDoctor = `${appointment._idDoctor.firstName} ${appointment._idDoctor.lastName}`;
        const namePK = appointment._idDoctor.phongKhamId.name;
        const addressPK = appointment._idDoctor.phongKhamId.address;
        const sdtPK = appointment._idDoctor.phongKhamId.sdtPK;
        const sdtDoct = appointment._idDoctor.phoneNumber;
        const stringTrangThaiKham = appointment.trangThaiKham
          ? "Đã khám xong"
          : "chưa khám bệnh";

        // Gửi email thông báo
        await sendAppointmentEmailBenhAn(
          email,
          patientName,
          nameDoctor,
          tenGioKham,
          ngayKhamBenh,
          giaKham,
          address,
          phone,
          lidokham,
          stringTrangThaiKham,
          benhAn,
          namePK,
          addressPK,
          sdtDoct,
          sdtPK
        );

        return res.status(200).json({
          data: updatedAppointment,
          message:
            "Chỉnh sửa thông tin khám bác sĩ thành công và email đã được gửi.",
        });
      } else {
        return res.status(404).json({
          message: "Chỉnh sửa thông tin khám bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi Chỉnh sửa tài khoản bác sĩ.",
        error: error.message,
      });
    }
  },

  xacNhanLich: async (req, res) => {
    try {
      const { id, trangThaiXacNhan } = req.body;
      console.log("active: ", trangThaiXacNhan);

      // Cập nhật trạng thái xác nhận trong cơ sở dữ liệu
      const updatedAccount = await KhamBenh.findByIdAndUpdate(
        id,
        { trangThaiXacNhan },
        { new: true }
      );
      if (updatedAccount) {
        // Lấy thông tin của bệnh nhân và bác sĩ từ tài liệu đã được cập nhật
        const { email, patientName, tenGioKham, ngayKhamBenh, _idDoctor } =
          updatedAccount;

        // Tìm bác sĩ từ _idDoctor nếu cần (giả sử bạn có model Doctor để lấy tên bác sĩ)
        const doctor = await Doctor.findById(_idDoctor).populate(
          "chuyenKhoaId phongKhamId thoiGianKham"
        );
        const doctorName = doctor
          ? `${doctor.lastName} ${doctor.firstName}`
          : "Unknown Doctor";

        // Lấy trạng thái xác nhận và tạo thông báo trạng thái
        let stringTrangThaiXacNhan = "";
        if (trangThaiXacNhan) {
          stringTrangThaiXacNhan = "Lịch khám đã được xác nhận";
        } else {
          stringTrangThaiXacNhan =
            "Vui lòng chờ nhân viên gọi điện xác nhận lịch hẹn!";
        }

        // Gửi email thông báo trạng thái lịch khám
        await sendAppointmentEmail(
          email,
          patientName,
          doctorName,
          tenGioKham,
          ngayKhamBenh,
          updatedAccount.giaKham,
          updatedAccount.address,
          updatedAccount.phone,
          updatedAccount.lidokham,
          stringTrangThaiXacNhan,
          doctor.phongKhamId.name,
          doctor.phongKhamId.address,
          doctor.phoneNumber,
          doctor.phongKhamId.sdtPK
        );

        return res
          .status(200)
          .json({
            message:
              "Cập nhật trạng thái lịch khám thành công và email đã được gửi.",
            data: updatedAccount,
          });
      } else {
        return res.status(404).json({ message: "Lịch khám không tìm thấy." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi cập nhật trạng thái.",
        error: error.message,
      });
    }
  },

  datLichKham: async (req, res) => {
    try {
      const {
        _idDoctor,
        _idTaiKhoan,
        patientName,
        email,
        gender,
        phone,
        dateBenhNhan,
        address,
        lidokham,
        hinhThucTT,
        tenGioKham,
        ngayKhamBenh,
        giaKham,
      } = req.body;

      // Parse the date
      const [day, month, year] = ngayKhamBenh.split("/").map(Number);
      const appointmentDate = new Date(year, month - 1, day);

      // Parse the time range for the new appointment
      const [startTimeStr, endTimeStr] = tenGioKham.split(" - ");
      const [startHour, startMinute] = startTimeStr.split(":").map(Number);
      const [endHour, endMinute] = endTimeStr.split(":").map(Number);

      const newStartTime = new Date(appointmentDate);
      newStartTime.setHours(startHour, startMinute);

      const newEndTime = new Date(appointmentDate);
      newEndTime.setHours(endHour, endMinute);

      // Check for existing appointments
      const existingAppointments = await KhamBenh.find({
        _idDoctor,
        ngayKhamBenh,
        trangThaiXacNhan: true,
      });

      // Check for overlapping appointments
      for (const appointment of existingAppointments) {
        const [existingStartStr, existingEndStr] =
          appointment.tenGioKham.split(" - ");
        const [existingStartHour, existingStartMinute] = existingStartStr
          .split(":")
          .map(Number);
        const [existingEndHour, existingEndMinute] = existingEndStr
          .split(":")
          .map(Number);

        const existingStartTime = new Date(appointmentDate);
        existingStartTime.setHours(existingStartHour, existingStartMinute);

        const existingEndTime = new Date(appointmentDate);
        existingEndTime.setHours(existingEndHour, existingEndMinute);

        // Check if there's an overlap
        if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
          return res
            .status(400)
            .json({
              message:
                "Có vẻ lịch khám này đã có bệnh nhân đăng ký rồi. Vui lòng chọn thời gian khác.",
            });
        }
      }

      // Đặt lịch khám
      let datlich = await KhamBenh.create({
        _idDoctor,
        _idTaiKhoan,
        patientName,
        email,
        gender,
        phone,
        dateBenhNhan,
        address,
        lidokham,
        hinhThucTT,
        tenGioKham,
        ngayKhamBenh,
        giaKham,
      });

      if (!datlich) {
        return res.status(404).json({ message: "Đặt lịch thất bại!" });
      }

      const populatedAppointment = await KhamBenh.findById(datlich._id)
        .populate("_idDoctor _idTaiKhoan")
        .populate({
          path: "_idDoctor", // Populate thông tin bác sĩ
          populate: {
            path: "phongKhamId", // Populate phongKhamId từ Doctor
            model: "PhongKham", // Model của phongKhamId là PhongKham
          },
        });
      console.log("populatedAppointment: ", populatedAppointment);

      let lastName = populatedAppointment._idDoctor.lastName;
      let firstName = populatedAppointment._idDoctor.firstName;
      let sdtDoct = populatedAppointment._idDoctor.phoneNumber;
      let namePK = populatedAppointment._idDoctor.phongKhamId.name;
      let addressPK = populatedAppointment._idDoctor.phongKhamId.address;
      let sdtPK = populatedAppointment._idDoctor.phongKhamId.sdtPK;

      console.log("namePK: ", namePK);
      console.log("addressPK: ", addressPK);

      let nameDoctor = `${lastName} ${firstName}`;
      let trangThaiXacNhan = populatedAppointment.trangThaiXacNhan;
      let stringTrangThaiXacNhan = "";
      if (trangThaiXacNhan === true) {
        stringTrangThaiXacNhan = "Đã đặt lịch";
      } else {
        stringTrangThaiXacNhan =
          "vui lòng chờ nhân viên gọi điện xác nhận lịch hẹn!";
      }

      // Gửi email thông báo lịch khám
      await sendAppointmentEmail(
        email,
        patientName,
        nameDoctor,
        tenGioKham,
        ngayKhamBenh,
        giaKham,
        address,
        phone,
        lidokham,
        stringTrangThaiXacNhan,
        namePK,
        addressPK,
        sdtDoct,
        sdtPK
      );

      return res
        .status(200)
        .json({ message: "Đặt lịch khám thành công!", data: datlich });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  datLichKhamTTVNPay: async (req, res) => {
    try {
      const {
        _idDoctor,
        _idTaiKhoan,
        patientName,
        email,
        gender,
        phone,
        dateBenhNhan,
        address,
        lidokham,
        hinhThucTT,
        tenGioKham,
        ngayKhamBenh,
        giaKham,
      } = req.body;

      // Parse the date
      const [day, month, year] = ngayKhamBenh.split("/").map(Number);
      const appointmentDate = new Date(year, month - 1, day);

      // Parse the time range for the new appointment
      const [startTimeStr, endTimeStr] = tenGioKham.split(" - ");
      const [startHour, startMinute] = startTimeStr.split(":").map(Number);
      const [endHour, endMinute] = endTimeStr.split(":").map(Number);

      const newStartTime = new Date(appointmentDate);
      newStartTime.setHours(startHour, startMinute);

      const newEndTime = new Date(appointmentDate);
      newEndTime.setHours(endHour, endMinute);

      // Check for existing appointments
      const existingAppointments = await KhamBenh.find({
        _idDoctor,
        ngayKhamBenh,
        trangThaiXacNhan: true,
      });

      // Check for overlapping appointments
      for (const appointment of existingAppointments) {
        const [existingStartStr, existingEndStr] =
          appointment.tenGioKham.split(" - ");
        const [existingStartHour, existingStartMinute] = existingStartStr
          .split(":")
          .map(Number);
        const [existingEndHour, existingEndMinute] = existingEndStr
          .split(":")
          .map(Number);

        const existingStartTime = new Date(appointmentDate);
        existingStartTime.setHours(existingStartHour, existingStartMinute);

        const existingEndTime = new Date(appointmentDate);
        existingEndTime.setHours(existingEndHour, existingEndMinute);

        // Check if there's an overlap
        if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
          return res
            .status(400)
            .json({
              message:
                "Có vẻ lịch khám này đã có bệnh nhân đăng ký rồi. Vui lòng chọn thời gian khác.",
            });
        }
      }

      // Đặt lịch khám
      let datlich = await KhamBenh.create({
        _idDoctor,
        _idTaiKhoan,
        patientName,
        email,
        gender,
        phone,
        dateBenhNhan,
        address,
        lidokham,
        hinhThucTT,
        tenGioKham,
        ngayKhamBenh,
        giaKham,
      });

      if (!datlich) {
        return res.status(404).json({ message: "Đặt lịch thất bại!" });
      }

      const populatedAppointment = await KhamBenh.findById(datlich._id)
        .populate("_idDoctor _idTaiKhoan")
        .populate({
          path: "_idDoctor", // Populate thông tin bác sĩ
          populate: {
            path: "phongKhamId", // Populate phongKhamId từ Doctor
            model: "PhongKham", // Model của phongKhamId là PhongKham
          },
        });
      console.log("populatedAppointment: ", populatedAppointment);

      let lastName = populatedAppointment._idDoctor.lastName;
      let firstName = populatedAppointment._idDoctor.firstName;
      let sdtDoct = populatedAppointment._idDoctor.phoneNumber;
      let namePK = populatedAppointment._idDoctor.phongKhamId.name;
      let addressPK = populatedAppointment._idDoctor.phongKhamId.address;
      let sdtPK = populatedAppointment._idDoctor.phongKhamId.sdtPK;

      console.log("namePK: ", namePK);
      console.log("addressPK: ", addressPK);

      let nameDoctor = `${lastName} ${firstName}`;
      let trangThaiXacNhan = populatedAppointment.trangThaiXacNhan;
      let stringTrangThaiXacNhan = "";
      if (trangThaiXacNhan === true) {
        stringTrangThaiXacNhan = "Đã đặt lịch";
      } else {
        stringTrangThaiXacNhan =
          "vui lòng chờ nhân viên gọi điện xác nhận lịch hẹn!";
      }

      // Gửi email thông báo lịch khám
      await sendAppointmentEmail(
        email,
        patientName,
        nameDoctor,
        tenGioKham,
        ngayKhamBenh,
        giaKham,
        address,
        phone,
        lidokham,
        stringTrangThaiXacNhan,
        namePK,
        addressPK,
        sdtDoct,
        sdtPK
      );

      // Lấy returnUrl từ frontend gửi lên, nếu không có thì sử dụng mặc định
      const returnUrl =
        req.body?.returnUrl || "http://localhost:8089/api/doctor/vnpay_return";

      // Tạo URL thanh toán
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: giaKham,
        vnp_IpAddr:
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.ip,
        vnp_TxnRef: datlich._id.toString(),
        vnp_OrderInfo: `Thanh toan don hang ${datlich._id}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl, // Đường dẫn nên là của frontend
        vnp_Locale: VnpLocale.VN,
      });

      return res
        .status(200)
        .json({
          message: "Đặt lịch khám thành công!",
          data: datlich,
          paymentUrl,
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  fetchAllDoctor: async (req, res) => {
    try {
      const { page, limit, firstName, lastName, address } = req.query; // Lấy trang và kích thước trang từ query

      // Chuyển đổi thành số
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Tính toán số bản ghi bỏ qua
      const skip = (pageNumber - 1) * limitNumber;

      // Tạo query tìm kiếm
      const query = {};
      // if (firstName) {
      //     query.firstName = { $regex: firstName, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa chữ thường
      // }
      // if (lastName) {
      //     query.lastName = { $regex: lastName, $options: 'i' };
      // }
      // Tạo điều kiện tìm kiếm
      if (firstName || lastName || address) {
        const searchKeywords =
          (firstName || "") + " " + (lastName || "") + " " + (address || "");
        const keywordsArray = searchKeywords.trim().split(/\s+/);

        const searchConditions = keywordsArray.map((keyword) => ({
          $or: [
            { firstName: { $regex: keyword, $options: "i" } },
            { lastName: { $regex: keyword, $options: "i" } },
            { address: { $regex: keyword, $options: "i" } },
          ],
        }));

        query.$or = searchConditions;
      }

      // Tìm tất cả bác sĩ với phân trang
      const fetchAll = await Doctor.find(query)
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId", // Đường dẫn đến trường cần populate
          model: "ThoiGianGio", // Tên model của trường cần populate
        })
        .skip(skip)
        .limit(limitNumber);

      console.log("fetchAll: ", fetchAll);

      const totalDoctors = await Doctor.countDocuments(query); // Đếm tổng số bác sĩ

      const totalPages = Math.ceil(totalDoctors / limitNumber); // Tính số trang

      return res.status(200).json({
        data: fetchAll,
        totalDoctors,
        totalPages,
        currentPage: pageNumber,
        message: "Đã tìm ra tất cả bác sĩ",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi tìm tài khoản bác sĩ.",
        error: error.message,
      });
    }
  },

  fetchAllChuyenKhoa: async (req, res) => {
    try {
      const { page, limit, name } = req.query;

      // Chuyển đổi thành số
      const pageNumber = parseInt(page, 10) || 1; // Mặc định là trang 1 nếu không có
      const limitNumber = parseInt(limit, 10) || 10; // Mặc định là 10 bản ghi mỗi trang

      // Tính toán số bản ghi bỏ qua
      const skip = Math.max((pageNumber - 1) * limitNumber, 0);

      // Tạo query tìm kiếm
      const query = {};
      // Tạo điều kiện tìm kiếm
      if (name) {
        const searchKeywords = name || "";
        const keywordsArray = searchKeywords.trim().split(/\s+/);

        const searchConditions = keywordsArray.map((keyword) => ({
          name: { $regex: keyword, $options: "i" }, // Tìm kiếm không phân biệt chữ hoa chữ thường
        }));

        query.$or = searchConditions;
      }

      let fetchAll = await ChuyenKhoa.find(query).skip(skip).limit(limitNumber);

      const totalChuyenKhoa = await ChuyenKhoa.countDocuments(query); // Đếm tổng số chức vụ

      const totalPages = Math.ceil(totalChuyenKhoa / limitNumber); // Tính số trang

      return res.status(200).json({
        data: fetchAll,
        totalChuyenKhoa,
        totalPages,
        currentPage: pageNumber,
        message: "Đã tìm ra tất cả chuyên khoa",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi tìm Chuyên khoa của bác sĩ.",
        error: error.message,
      });
    }
  },

  fetchAllChucVu: async (req, res) => {
    try {
      const { page, limit, name } = req.query; // Lấy trang và kích thước trang từ query

      // Chuyển đổi thành số
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Tính toán số bản ghi bỏ qua
      const skip = (pageNumber - 1) * limitNumber;

      // Tạo query tìm kiếm
      const query = {};
      if (name) {
        // query.name = { $regex: name, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa chữ thường
        query.name = { $regex: `.*${name}.*`, $options: "i" }; // Tìm kiếm gần đúng
      }

      // Tìm tất cả bác sĩ với phân trang
      const fetchAll = await ChucVu.find(query).skip(skip).limit(limitNumber);

      const totalChucVu = await ChucVu.countDocuments(query); // Đếm tổng số chức vụ

      const totalPages = Math.ceil(totalChucVu / limitNumber); // Tính số trang

      return res.status(200).json({
        data: fetchAll,
        totalChucVu,
        totalPages,
        currentPage: pageNumber,
        message: "Đã tìm ra tất cả chức vụ",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi tìm chức vụ của bác sĩ.",
        error: error.message,
      });
    }
  },

  fetchAllPhongKham: async (req, res) => {
    try {
      const { page, limit, name, address } = req.query; // Lấy trang và kích thước trang từ query

      // Chuyển đổi thành số
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Tính toán số bản ghi bỏ qua
      const skip = (pageNumber - 1) * limitNumber;

      // Tạo query tìm kiếm
      const query = {};
      // Tạo điều kiện tìm kiếm
      if (name || address) {
        const searchKeywords = (name || "") + " " + (address || "");
        const keywordsArray = searchKeywords.trim().split(/\s+/);

        const searchConditions = keywordsArray.map((keyword) => ({
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { address: { $regex: keyword, $options: "i" } },
          ],
        }));

        query.$or = searchConditions;
      }

      let fetchAll = await PhongKham.find(query).skip(skip).limit(limitNumber);

      const totalPhongKham = await PhongKham.countDocuments(query); // Đếm tổng số chức vụ

      const totalPages = Math.ceil(totalPhongKham / limitNumber); // Tính số trang

      return res.status(200).json({
        data: fetchAll,
        totalPhongKham,
        totalPages,
        currentPage: pageNumber,
        message: "Đã tìm ra tất cả chức vụ",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi tìm phòng khám của bác sĩ.",
        error: error.message,
      });
    }
  },

  fetchAllThoiGianGio: async (req, res) => {
    const resGio = await ThoiGianGio.find({});
    if (resGio) {
      return res.status(200).json({
        data: resGio,
        message: "Đã tìm ra tất cả thoi gian",
      });
    } else {
      return res.status(500).json({
        message: "Có lỗi xảy ra",
      });
    }
  },

  createDoctor: async (req, res) => {
    try {
      let {
        email,
        password,
        firstName,
        lastName,
        address,
        phoneNumber,
        giaKhamVN,
        giaKhamNuocNgoai,
        chucVuId,
        gender,
        image,
        chuyenKhoaId,
        phongKhamId,
        roleId,
        mota,
      } = req.body;

      console.log("chucVuId: ", chucVuId);
      console.log("chuyenKhoaId: ", chuyenKhoaId);
      console.log("giaKhamVN: ", giaKhamVN);
      console.log("giaKhamNuocNgoai: ", giaKhamNuocNgoai);

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          message:
            "Vui lòng cung cấp đầy đủ thông tin (email, password, firstName, lastName)",
        });
      }

      const existingDoctor = await Doctor.findOne({ email: email });
      if (existingDoctor) {
        return res.status(409).json({
          message: "Email đã tồn tại. Vui lòng sử dụng email khác.",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      let createDoctor = await Doctor.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        address,
        phoneNumber,
        chucVuId: chucVuId || [],
        gender,
        image,
        chuyenKhoaId: chuyenKhoaId || [],
        phongKhamId,
        roleId,
        mota,
        giaKhamVN,
        giaKhamNuocNgoai,
      });

      if (createDoctor) {
        console.log("thêm thành công tài khoản");
        return res.status(200).json({
          data: createDoctor,
          message: "Thêm tài khoản bác sĩ thành công",
        });
      } else {
        return res.status(404).json({
          message: "Thêm tài khoản bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi thêm tài khoản bác sĩ.",
        error: error.message,
      });
    }
  },

  createChucVu: async (req, res) => {
    try {
      let { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "Vui lòng cung cấp đầy đủ thông tin (name)",
        });
      }

      // tìm tên chức vụ bác sĩ chính xác nếu trùng thì không được thêm
      const existingChucVu = await ChucVu.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (existingChucVu) {
        return res.status(409).json({
          message: "Tên chức vụ đã tồn tại. Vui lòng sử dụng chức vụ khác.",
        });
      }

      let createChucVu = await ChucVu.create({ name, description });

      if (createChucVu) {
        console.log("thêm thành công chức vụ");
        return res.status(200).json({
          data: createChucVu,
          message: "Thêm chức vụ bác sĩ thành công",
        });
      } else {
        return res.status(404).json({
          message: "Thêm chức vụ bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi thêm chức vụ bác sĩ.",
        error: error.message,
      });
    }
  },

  createPhongKham: async (req, res) => {
    try {
      let { name, address, description, image, sdtPK } = req.body;
      console.log("anhr: ", image);

      if (!name || !address) {
        return res.status(400).json({
          message:
            "Vui lòng cung cấp đầy đủ thông tin (tên phòng khám, địa chỉ)",
        });
      }

      let createPhongKham = await PhongKham.create({
        name,
        address,
        description,
        image,
        sdtPK,
      });

      if (createPhongKham) {
        console.log("thêm thành công phòng khám");
        return res.status(200).json({
          data: createPhongKham,
          message: "Thêm phòng khám thành công",
        });
      } else {
        return res.status(404).json({
          message: "Thêm phòng khám thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi thêm phòng khám.",
        error: error.message,
      });
    }
  },

  createChuyenKhoa: async (req, res) => {
    try {
      let { name, description, image } = req.body;
      console.log("anhr: ", image);

      // tìm tên chuyên khoa bác sĩ chính xác nếu trùng thì không được thêm
      const existingChuyenKhoa = await ChuyenKhoa.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (existingChuyenKhoa) {
        return res.status(409).json({
          message:
            "Tên chuyên khoa đã tồn tại. Vui lòng sử dụng chuyên khoa khác.",
        });
      }

      if (!name) {
        return res.status(400).json({
          message: "Vui lòng cung cấp đầy đủ thông tin (tên chuyên khoa)",
        });
      }

      let createChuyenKhoa = await ChuyenKhoa.create({
        name,
        description,
        image,
      });

      if (createChuyenKhoa) {
        console.log("thêm thành công chuyên khoa");
        return res.status(200).json({
          data: createChuyenKhoa,
          message: "Thêm chuyên khoa thành công",
        });
      } else {
        return res.status(404).json({
          message: "Thêm chuyên khoa thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi thêm chuyên khoa.",
        error: error.message,
      });
    }
  },

  updateDoctor: async (req, res) => {
    try {
      let {
        _id,
        email,
        password,
        firstName,
        lastName,
        address,
        phoneNumber,
        giaKhamVN,
        giaKhamNuocNgoai,
        chucVuId,
        gender,
        image,
        chuyenKhoaId,
        phongKhamId,
        roleId,
        mota,
      } = req.body;

      console.log("id: ", _id);

      // Hash the password
      // const hashedPassword = await bcrypt.hash(password, 10);

      let createDoctor = await Doctor.updateOne(
        { _id: _id },
        {
          email,
          // password: hashedPassword,
          firstName,
          lastName,
          address,
          phoneNumber,
          chucVuId: chucVuId || [],
          gender,
          image,
          chuyenKhoaId: chuyenKhoaId || [],
          phongKhamId,
          roleId,
          mota,
          giaKhamVN,
          giaKhamNuocNgoai,
        }
      );

      if (createDoctor) {
        console.log("Chỉnh sửa thành công tài khoản");
        return res.status(200).json({
          data: createDoctor,
          message: "Chỉnh sửa tài khoản bác sĩ thành công",
        });
      } else {
        return res.status(404).json({
          message: "Chỉnh sửa tài khoản bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi Chỉnh sửa tài khoản bác sĩ.",
        error: error.message,
      });
    }
  },

  updateChucVu: async (req, res) => {
    try {
      let { _id, name, description } = req.body;

      console.log("id: ", _id);

      let createChucVu = await ChucVu.updateOne(
        { _id: _id },
        { name, description }
      );

      if (createChucVu) {
        console.log("Chỉnh sửa thành công chức vụ");
        return res.status(200).json({
          data: createChucVu,
          message: "Chỉnh sửa chức vụ bác sĩ thành công",
        });
      } else {
        return res.status(404).json({
          message: "Chỉnh sửa chức vụ bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi Chỉnh sửa tài khoản bác sĩ.",
        error: error.message,
      });
    }
  },

  updatePhongKham: async (req, res) => {
    try {
      let { _id, name, address, description, image, sdtPK } = req.body;

      let createPhongKham = await PhongKham.updateOne(
        { _id: _id },
        { name, address, description, image, sdtPK }
      );

      if (createPhongKham) {
        console.log("Chỉnh sửa thành công tài khoản");
        return res.status(200).json({
          data: createPhongKham,
          message: "Chỉnh sửa phòng khám thành công",
        });
      } else {
        return res.status(404).json({
          message: "Chỉnh sửa phòng khám thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi Chỉnh sửa phòng khám.",
        error: error.message,
      });
    }
  },

  updateChuyenKhoa: async (req, res) => {
    try {
      let { _id, name, description, image } = req.body;

      let updateChuyenKhoa = await ChuyenKhoa.updateOne(
        { _id: _id },
        { name, description, image }
      );

      if (updateChuyenKhoa) {
        return res.status(200).json({
          data: updateChuyenKhoa,
          message: "Chỉnh sửa chuyên khoa thành công",
        });
      } else {
        return res.status(404).json({
          message: "Chỉnh sửa chuyên khoa thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi Chỉnh sửa chuyên khoa.",
        error: error.message,
      });
    }
  },

  deleteDoctor: async (req, res) => {
    const _id = req.params.id;

    let xoaAD = await Doctor.deleteOne({ _id: _id });

    if (xoaAD) {
      return res.status(200).json({
        data: xoaAD,
        message: "Bạn đã xoá tài khoản bác sĩ thành công!",
      });
    } else {
      return res.status(500).json({
        message: "Bạn đã xoá tài khoản bác sĩ thất bại!",
      });
    }
  },

  deleteChucVu: async (req, res) => {
    const _id = req.params.id;

    let xoaAD = await ChucVu.deleteOne({ _id: _id });

    if (xoaAD) {
      return res.status(200).json({
        data: xoaAD,
        message: "Bạn đã xoá chức vụ bác sĩ thành công!",
      });
    } else {
      return res.status(500).json({
        message: "Bạn đã xoá chức vụ bác sĩ thất bại!",
      });
    }
  },

  deletePhongKham: async (req, res) => {
    const _id = req.params.id;

    let xoaAD = await PhongKham.deleteOne({ _id: _id });

    if (xoaAD) {
      return res.status(200).json({
        data: xoaAD,
        message: "Bạn đã xoá phòng khám thành công!",
      });
    } else {
      return res.status(500).json({
        message: "Bạn đã xoá phòng khám thất bại!",
      });
    }
  },

  deleteChuyenKhoa: async (req, res) => {
    const _id = req.params.id;

    let xoaAD = await ChuyenKhoa.deleteOne({ _id: _id });

    if (xoaAD) {
      return res.status(200).json({
        data: xoaAD,
        message: "Bạn đã xoá chuyên khoa thành công!",
      });
    } else {
      return res.status(500).json({
        message: "Bạn đã xoá chuyên khoa thất bại!",
      });
    }
  },

  deleteLichHen: async (req, res) => {
    const _id = req.params.id;

    const populatedAppointment = await KhamBenh.findById({ _id: _id })
      .populate("_idDoctor _idTaiKhoan")
      .populate({
        path: "_idDoctor", // Populate thông tin bác sĩ
        populate: {
          path: "phongKhamId", // Populate phongKhamId từ Doctor
          model: "PhongKham", // Model của phongKhamId là PhongKham
        },
      });
    console.log("populatedAppointment: ", populatedAppointment);
    let xoaAD = await KhamBenh.deleteOne({ _id: _id });

    if (xoaAD) {
      let lastName = populatedAppointment._idDoctor.lastName;
      let firstName = populatedAppointment._idDoctor.firstName;
      let sdtDoct = populatedAppointment._idDoctor.phoneNumber;
      let namePK = populatedAppointment._idDoctor.phongKhamId.name;
      let addressPK = populatedAppointment._idDoctor.phongKhamId.address;
      let sdtPK = populatedAppointment._idDoctor.phongKhamId.sdtPK;

      console.log("namePK: ", namePK);
      console.log("addressPK: ", addressPK);

      let nameDoctor = `${lastName} ${firstName}`;
      let trangThaiXacNhan = populatedAppointment.trangThaiXacNhan;
      let stringTrangThaiXacNhan = "";
      if (trangThaiXacNhan === true) {
        stringTrangThaiXacNhan = "Đã đặt lịch";
      } else {
        stringTrangThaiXacNhan =
          "vui lòng chờ nhân viên gọi điện xác nhận lịch hẹn!";
      }

      // Gửi email thông báo lịch khám
      await sendAppointmentEmailHuyLich(
        populatedAppointment.email,
        populatedAppointment.patientName,
        nameDoctor,
        populatedAppointment.tenGioKham,
        populatedAppointment.ngayKhamBenh,
        populatedAppointment.giaKham,
        populatedAppointment.address,
        populatedAppointment.phone,
        populatedAppointment.lidokham,
        stringTrangThaiXacNhan,
        namePK,
        addressPK,
        sdtDoct,
        sdtPK
      );

      return res.status(200).json({
        data: xoaAD,
        message: "Bạn đã xoá lịch hẹn thành công!",
      });
    } else {
      return res.status(500).json({
        message: "Bạn đã xoá lịch hẹn thất bại!",
      });
    }
  },

  // them thoi gian kham benh cho doctor
  addTimeKhamBenhDoctor: async (req, res) => {
    const { date, time, _id } = req.body;
    console.log("date: ", date);
    console.log("time: ", time);
    console.log("_id: ", _id);

    try {
      const doctor = await Doctor.findById(_id);
      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
      }

      // Convert date from request, ensuring the correct format
      const requestDate = moment(date, "DD-MM-YYYY")
        .startOf("day")
        .format("YYYY-MM-DD");

      if (!moment(requestDate, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).json({ message: "Ngày không hợp lệ!" });
      }

      // Check if there's already a time slot for the given date
      const existingTimeSlot = doctor.thoiGianKham.find(
        (slot) => slot.date === requestDate
      );

      if (existingTimeSlot) {
        // Nếu đã tồn tại time slot, cập nhật lại danh sách thoiGianId
        // Giữ lại các `timeId` được gửi trong yêu cầu, xóa các `timeId` không còn được chọn
        const updatedTimeIds = time;
        existingTimeSlot.thoiGianId = updatedTimeIds;
      } else if (time.length > 0) {
        // Nếu không tồn tại time slot, tạo mới chỉ khi danh sách `time` không rỗng
        doctor.thoiGianKham.push({ date: requestDate, thoiGianId: time });
      }

      // Call the removeExpiredTimeSlots method to clean up any expired time slots
      await doctor.removeExpiredTimeSlots();

      // Save changes
      await doctor.save();
      return res
        .status(200)
        .json({
          message: "Cập nhật lịch trình khám bệnh thành công!",
          data: doctor,
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  addTimeKhamBenhDoctor1: async (req, res) => {
    const { date, time, _id } = req.body; // Lấy _id từ body
    console.log("date: ", date);
    console.log("time: ", time);
    console.log("_id: ", _id);

    try {
      // Tìm bác sĩ theo ID
      const doctor = await Doctor.findById(_id);
      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
      }

      // Chuyển đổi ngày từ request
      // const requestDate = moment(date).startOf('day');
      // const requestDate = moment(date).tz('Asia/Bangkok').startOf('day');
      // console.log("requestDate: ", requestDate);

      // // Kiểm tra xem thời gian đã tồn tại cho ngày này chưa
      // const existingTimeSlot = doctor.thoiGianKham.find(slot => {
      //     const slotDate = moment(slot.date).tz('Asia/Bangkok').startOf('day'); // Đảm bảo so sánh đúng múi giờ
      //     console.log("slotDate: ",slotDate);
      //     return slotDate.isSame(requestDate, 'day');
      // });

      // Chuyển đổi ngày từ request, đảm bảo đúng định dạng
      const requestDate = moment(date, "DD-MM-YYYY")
        .startOf("day")
        .format("YYYY-MM-DD");

      if (!moment(requestDate, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).json({ message: "Ngày không hợp lệ!" });
      }

      // Xóa các lịch trình cũ
      // doctor.thoiGianKham = doctor.thoiGianKham.filter(slot => moment(slot.date).isSameOrAfter(moment(), 'day'));

      // Kiểm tra xem thời gian đã tồn tại cho ngày này chưa
      const existingTimeSlot = doctor.thoiGianKham.find(
        (slot) => slot.date === requestDate
      );

      if (existingTimeSlot) {
        // Lấy mảng các thoiGianId hiện tại
        const existingTimeIds = existingTimeSlot.thoiGianId.map((id) =>
          id.toString()
        );

        // Lọc ra các thời gian mới không có trong existingTimeIds
        const newTimeIds = time.filter(
          (timeId) => !existingTimeIds.includes(timeId)
        );

        // Cập nhật thoiGianId với các ID mới
        existingTimeSlot.thoiGianId = [
          ...new Set([...existingTimeSlot.thoiGianId, ...newTimeIds]),
        ];

        // Xóa đi các thoiGianId không còn trong danh sách mới
        existingTimeSlot.thoiGianId = existingTimeSlot.thoiGianId.filter(
          (timeId) => time.includes(timeId.toString())
        );
      } else {
        // Nếu chưa tồn tại, tạo một lịch khám mới
        // doctor.thoiGianKham.push({ date: requestDate.toDate(), thoiGianId: time });
        doctor.thoiGianKham.push({ date: requestDate, thoiGianId: time });
      }

      // Lưu thay đổi
      await doctor.save();

      return res
        .status(200)
        .json({
          message: "Cập nhật lịch trình khám bệnh thành công!",
          data: doctor,
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  // xóa lịch trình quá cũ
  deleteOldTimeSlots: async (req, res) => {
    const { _id } = req.body; // Lấy _id từ body
    console.log("_id: ", _id);

    try {
      // Tìm bác sĩ theo ID
      const doctor = await Doctor.findById(_id);
      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
      }

      // Xóa các lịch trình cũ
      // doctor.thoiGianKham = doctor.thoiGianKham.filter(slot => moment(slot.date).isSameOrAfter(moment(), 'day'));

      // Lọc các lịch trình đã qua
      const oldSlots = doctor.thoiGianKham.filter((slot) =>
        moment(slot.date).isBefore(moment(), "day")
      );

      console.log("oldSlots: ", oldSlots);

      // Kiểm tra xem có lịch trình cũ không
      if (oldSlots.length === 0) {
        return res
          .status(400)
          .json({ message: "Không có lịch trình cũ để xóa!" });
      }

      // Xóa các lịch trình cũ
      doctor.thoiGianKham = doctor.thoiGianKham.filter((slot) =>
        moment(slot.date).isSameOrAfter(moment(), "day")
      );

      // Lưu thay đổi
      await doctor.save();

      return res
        .status(200)
        .json({
          message: "Đã xóa các lịch trình cũ thành công!",
          data: doctor,
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  // API để lấy thời gian khám của bác sĩ theo ngày
  getTimeSlotsByDoctorAndDate: async (req, res) => {
    const { doctorId, date } = req.query; // Lấy doctorId và date từ query
    console.log("doctorId, date: ", doctorId, date);

    try {
      // Tìm bác sĩ theo ID
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
      }

      // Chuyển đổi ngày từ query
      const queryDate = moment.utc(date).startOf("day");

      const timeSlot = doctor.thoiGianKham.find((slot) => {
        const slotDate = moment.utc(slot.date).startOf("day");
        return slotDate.isSame(queryDate);
      });

      if (timeSlot) {
        // Lấy danh sách thoiGianId
        const timeGioIds = timeSlot.thoiGianId;

        // Tìm các tenGio tương ứng với thoiGianId
        const timeGioList = await ThoiGianGio.find({
          _id: { $in: timeGioIds },
        });

        // Tạo mảng các tenGio
        const tenGioArray = timeGioList.map((item) => item.tenGio);
        console.log("tenGioArray: ", tenGioArray);

        return res.status(200).json({
          message: "Lấy thời gian thành công!",
          timeSlots: timeSlot.thoiGianId,
          tenGioArray,
          timeGioList,
        });
      } else {
        return res
          .status(200)
          .json({
            message: "Không có thời gian khám cho ngày này!",
            timeSlots: [],
          });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  // tìm ra doctor để hiển thị chi tiết
  fetchDoctorById: async (req, res) => {
    let id = req.query.id;
    console.log("id doctor: ", id);
    try {
      const doctor = await Doctor.findById(id)
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId", // Đường dẫn đến trường cần populate
          model: "ThoiGianGio", // Tên model của trường cần populate
        });
      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
      }
      return res.status(200).json({
        message: "Đã tìm thấy bác sĩ",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  // tìm tt bác sĩ khi bệnh nhân đặt lịch (hiển thị lên page đặt lịch)
  fetchDoctorByNgayGio: async (req, res) => {
    try {
      const { id, idGioKhamBenh, ngayKham } = req.query; // Lấy doctorId và date từ query
      console.log("id, idGioKhamBenh, ngayKham: ", id, idGioKhamBenh, ngayKham);

      // Tìm bác sĩ theo ID
      const doctor = await Doctor.findById(id).populate(
        "chucVuId chuyenKhoaId phongKhamId roleId"
      );
      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
      }

      const timeGio = await ThoiGianGio.findById(idGioKhamBenh);
      if (!timeGio) {
        return res.status(404).json({ message: "tên giờ không tồn tại!" });
      }

      return res.status(200).json({
        message: "Da tim thay!",
        infoDoctor: doctor,
        tenGio: timeGio,
        ngayKham: ngayKham,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  datLichKham1: async (req, res) => {
    try {
      const {
        _idDoctor,
        _idTaiKhoan,
        patientName,
        email,
        gender,
        phone,
        dateBenhNhan,
        address,
        lidokham,
        hinhThucTT,
        tenGioKham,
        ngayKhamBenh,
        giaKham,
      } = req.body;

      // Parse the date
      const [day, month, year] = ngayKhamBenh.split("/").map(Number);
      const appointmentDate = new Date(year, month - 1, day);

      // Parse the time range for the new appointment
      const [startTimeStr, endTimeStr] = tenGioKham.split(" - ");
      const [startHour, startMinute] = startTimeStr.split(":").map(Number);
      const [endHour, endMinute] = endTimeStr.split(":").map(Number);

      const newStartTime = new Date(appointmentDate);
      newStartTime.setHours(startHour, startMinute);

      const newEndTime = new Date(appointmentDate);
      newEndTime.setHours(endHour, endMinute);

      // Check for existing appointments
      const existingAppointments = await KhamBenh.find({
        _idDoctor,
        ngayKhamBenh,
      });

      // Check for overlapping appointments
      for (const appointment of existingAppointments) {
        const [existingStartStr, existingEndStr] =
          appointment.tenGioKham.split(" - ");
        const [existingStartHour, existingStartMinute] = existingStartStr
          .split(":")
          .map(Number);
        const [existingEndHour, existingEndMinute] = existingEndStr
          .split(":")
          .map(Number);

        const existingStartTime = new Date(appointmentDate);
        existingStartTime.setHours(existingStartHour, existingStartMinute);

        const existingEndTime = new Date(appointmentDate);
        existingEndTime.setHours(existingEndHour, existingEndMinute);

        // Check if there's an overlap
        if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
          return res
            .status(400)
            .json({
              message:
                "Có vẻ lịch khám này đã có bệnh nhân đăng ký rồi. Vui lòng chọn thời gian khác.",
            });
        }
      }

      let datlich = await KhamBenh.create({
        _idDoctor,
        _idTaiKhoan,
        patientName,
        email,
        gender,
        phone,
        dateBenhNhan,
        address,
        lidokham,
        hinhThucTT,
        tenGioKham,
        ngayKhamBenh,
        giaKham,
      });

      if (!datlich) {
        return res.status(404).json({ message: "Đặt lịch thất bại!" });
      }

      return res.status(200).json({
        message: "Đặt lịch khám thành công!",
        data: datlich,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  getLichHen: async (req, res) => {
    try {
      let idKH = req.query.idKhachHang;

      const findLichHen = await KhamBenh.find({ _idTaiKhoan: idKH })
        .populate("_idDoctor _idTaiKhoan")
        .populate({
          path: "_idDoctor",
          populate: [
            { path: "chucVuId" },
            { path: "chuyenKhoaId" },
            { path: "phongKhamId" },
          ],
        })
        .populate({
          path: "_idTaiKhoan",
          model: "BenhNhan",
        });

      if (!findLichHen) {
        return res.status(404).json({ message: "Tìm lịch hẹn thất bại!" });
      }

      return res.status(200).json({
        message: "Tìm lịch hẹn thành công!",
        data: findLichHen,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  // tìm ra chuyenKhoa để hiển thị chi tiết
  fetchChuyenKhoaByID: async (req, res) => {
    let id = req.query.id;
    console.log("id chuyenKhoa: ", id);
    try {
      const chuyenKhoa = await ChuyenKhoa.findById(id);

      if (!chuyenKhoa) {
        return res.status(404).json({ message: "Chuyên khoa không tồn tại!" });
      }
      return res.status(200).json({
        message: "Đã tìm thấy Chuyên khoa",
        data: chuyenKhoa,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  fetchDoctorByChuyenKhoa: async (req, res) => {
    let id = req.query.idChuyenKhoa;
    console.log("id chuyenKhoa: ", id);

    try {
      const doctor = await Doctor.find({ chuyenKhoaId: id })
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId", // Đường dẫn đến trường cần populate
          model: "ThoiGianGio", // Tên model của trường cần populate
        });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor không tồn tại!" });
      }
      return res.status(200).json({
        message: "Đã tìm thấy Doctor",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  handleHuyOrder: async (req, res) => {
    try {
      let id = req.query.idHuy;

      let checkOrder = await KhamBenh.findById({ _id: id });

      if (!checkOrder) {
        return res.status(404).json({
          message: "Lịch hẹn không tồn tại!",
          errCode: -1,
        });
      }

      let updateOrder = await KhamBenh.updateOne(
        { _id: id },
        { trangThai: "Đã đặt lịch", trangThaiHuyDon: "Đã Hủy" }
      );
      if (updateOrder) {
        return res.status(200).json({
          message: "Hủy Lịch hẹn thành công!",
          errCode: 0,
          data: updateOrder,
        });
      } else {
        return res.status(500).json({
          message: "Hủy Lịch hẹn thất bại!",
          errCode: -1,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Đã xảy ra lỗi!",
        error: error.message,
      });
    }
  },

  findAllLichHen: async (req, res) => {
    try {
      const { page, limit, sort, order, lichHen } = req.query;

      // Chuyển đổi thành số
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Tính toán số bản ghi bỏ qua
      const skip = (pageNumber - 1) * limitNumber;

      const query = {};
      // Tạo điều kiện tìm kiếm
      if (lichHen) {
        const searchKeyword = lichHen.trim(); // Lấy 6 ký tự cuối của lichHen
        query._id = { $regex: `${searchKeyword}`, $options: "i" }; // So sánh 6 ký tự đầu của _id
      }

      // tang/giam
      let sortOrder = 1; // tang dn
      if (order === "desc") {
        sortOrder = -1;
      }

      let findOrder = await KhamBenh.find(query)
        .skip(skip)
        .limit(limitNumber)
        .populate("_idDoctor _idTaiKhoan")
        .populate({
          path: "_idDoctor", // Populate thông tin bác sĩ
          populate: {
            path: "phongKhamId", // Populate phongKhamId từ Doctor
            model: "PhongKham", // Model của phongKhamId là PhongKham
          },
        })
        .sort({ [sort]: sortOrder });

      // Tính tổng
      let totalOrder = await KhamBenh.countDocuments(query);
      let totalPage = Math.ceil(totalOrder / limitNumber);

      if (findOrder) {
        return res.status(200).json({
          message: "Tìm Order thành công!",
          errCode: 0,
          data: {
            findOrder: findOrder,
            totalOrder: totalOrder, // Tổng số Order cho sản phẩm này
            totalPages: totalPage, // Tổng số trang
            currentPage: pageNumber, // Trang hiện tại
          },
        });
      } else {
        return res.status(500).json({
          message: "Tìm Order thất bại!",
          errCode: -1,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Đã xảy ra lỗi!",
        error: error.message,
      });
    }
  },

  findAllLichHenByDoctor: async (req, res) => {
    try {
      const { page, limit, sort, order, idDoctor, search, locTheoLoai } =
        req.query;

      // Chuyển đổi thành số
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Tính toán số bản ghi bỏ qua
      const skip = (pageNumber - 1) * limitNumber;

      // tang/giam
      let sortOrder = 1; // tang dn
      if (order === "desc") {
        sortOrder = -1;
      }

      const query = {};
      if (search) {
        const searchKeywords = search
          .trim()
          .split(/\s+/)
          .map((keyword) => {
            const normalizedKeyword = keyword.toLowerCase(); // Chuyển tất cả về chữ thường để không phân biệt
            return {
              $or: [
                { patientName: { $regex: normalizedKeyword, $options: "i" } },
                { email: { $regex: normalizedKeyword, $options: "i" } },
                { phone: { $regex: normalizedKeyword, $options: "i" } },
                // { address: { $regex: normalizedKeyword, $options: 'i' } },
              ],
            };
          })
          .flat(); // flat() để biến các mảng lồng vào thành một mảng phẳng

        query.$and = searchKeywords; // Dùng $and để tìm tất cả các từ khóa
      }

      if (locTheoLoai && locTheoLoai.includes("choxacnhan")) {
        query.$and = [
          { trangThaiKham: false }, // Bệnh nhân chưa khám
          { trangThaiXacNhan: false }, // Bệnh nhân chưa xác nhận
          { trangThaiHuyDon: "Không Hủy" },
        ];
      } else if (locTheoLoai && locTheoLoai.includes("chokham")) {
        query.$and = [
          { trangThaiKham: false },
          { trangThaiXacNhan: true },
          { trangThaiHuyDon: "Không Hủy" },
        ];
      } else if (locTheoLoai && locTheoLoai.includes("dakham")) {
        query.$and = [
          { trangThaiKham: true },
          { trangThaiXacNhan: true },
          { trangThaiHuyDon: "Không Hủy" },
        ];
      } else if (locTheoLoai && locTheoLoai.includes("dahuy")) {
        query.$and = [{ trangThaiHuyDon: "Đã Hủy" }];
      }

      let findOrder = await KhamBenh.find({ _idDoctor: idDoctor, ...query })
        .skip(skip)
        .limit(limitNumber)
        .populate("_idDoctor _idTaiKhoan")
        .populate({
          path: "_idDoctor", // Populate thông tin bác sĩ
          populate: {
            path: "phongKhamId", // Populate phongKhamId từ Doctor
            model: "PhongKham", // Model của phongKhamId là PhongKham
          },
        })
        .sort({ [sort]: sortOrder });

      // Tính tổng
      let totalOrder = await KhamBenh.countDocuments({
        _idDoctor: idDoctor,
        ...query,
      });
      let totalPage = Math.ceil(totalOrder / limitNumber);

      // Nhóm các bệnh nhân theo email và đếm số lần khám
      let findOrderBN = await KhamBenh.find({ _idDoctor: idDoctor, ...query })
        .populate("_idDoctor _idTaiKhoan")
        .populate({
          path: "_idDoctor", // Populate thông tin bác sĩ
          populate: {
            path: "phongKhamId", // Populate phongKhamId từ Doctor
            model: "PhongKham", // Model của phongKhamId là PhongKham
          },
        })
        .sort({ [sort]: sortOrder });
      let patientStatistics = [];

      // Nhóm theo email chỉ khi trangThaiKham là true
      findOrderBN.forEach((order) => {
        const {
          _idTaiKhoan,
          email,
          trangThaiKham,
          patientName,
          address,
          phone,
          ngayKhamBenh,
          tenGioKham,
          benhAn,
          lidokham,
        } = order;

        // Chỉ xử lý bệnh nhân có trạng thái khám là true
        if (trangThaiKham === true) {
          // Kiểm tra nếu bệnh nhân đã có trong mảng thống kê
          let patient = patientStatistics.find((p) => p.email === email);

          if (!patient) {
            // Nếu chưa có, tạo mới đối tượng cho bệnh nhân
            patient = {
              email,
              patientName,
              address,
              phone,
              totalBooked: 0,
              totalConfirmed: 0,
              patientDetails: [], // Lưu thông tin chi tiết của từng lịch khám
            };
            patientStatistics.push(patient);
          }

          // Thêm lịch khám vào chi tiết của bệnh nhân
          patient.patientDetails.push({
            ngayKhamBenh,
            tenGioKham,
            benhAn,
            lidokham,
            trangThaiKham,
          });

          // Cập nhật số lần bệnh nhân đã đặt lịch
          patient.totalBooked += 1;

          // Cập nhật số lần bệnh nhân đã khám xong
          patient.totalConfirmed += 1;
        }
      });

      if (findOrder) {
        return res.status(200).json({
          message: "Tìm Order thành công!",
          errCode: 0,
          data: {
            patientStatistics,

            findOrder: findOrder,
            totalOrder: totalOrder, // Tổng số Order cho sản phẩm này
            totalPages: totalPage, // Tổng số trang
            currentPage: pageNumber, // Trang hiện tại
          },
        });
      } else {
        return res.status(500).json({
          message: "Tìm Order thất bại!",
          errCode: -1,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Đã xảy ra lỗi!",
        error: error.message,
      });
    }
  },

  fetchAllDoctorById: async (req, res) => {
    try {
      const { _id } = req.query; // Lấy trang và kích thước trang từ query

      const fetchAll = await Doctor.findOne({ _id: _id })
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId", // Đường dẫn đến trường cần populate
          model: "ThoiGianGio", // Tên model của trường cần populate
        });

      return res.status(200).json({
        data: fetchAll,
        message: "Đã tìm ra bác sĩ",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi tìm tài khoản bác sĩ.",
        error: error.message,
      });
    }
  },

  fetchPhongKhamByID: async (req, res) => {
    let id = req.query.id;
    console.log("id pk: ", id);
    try {
      const pk = await PhongKham.findById(id);

      if (!pk) {
        return res.status(404).json({ message: "Phong Kham không tồn tại!" });
      }
      return res.status(200).json({
        message: "Đã tìm thấy Phong Kham",
        data: pk,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  fetchDoctorByPhongKham: async (req, res) => {
    let id = req.query.idPhongKham;
    console.log("idPhongKham: ", id);

    try {
      const doctor = await Doctor.find({ phongKhamId: id })
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId", // Đường dẫn đến trường cần populate
          model: "ThoiGianGio", // Tên model của trường cần populate
        });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor không tồn tại!" });
      }
      return res.status(200).json({
        message: "Đã tìm thấy Doctor",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra!", error });
    }
  },

  xacNhanLich1: async (req, res) => {
    try {
      // const id = req.params.id
      const { id, trangThaiXacNhan } = req.body;
      console.log("active: ", trangThaiXacNhan);

      const updatedAccount = await KhamBenh.findByIdAndUpdate(
        id,
        { trangThaiXacNhan },
        { new: true }
      );

      if (updatedAccount) {
        return res
          .status(200)
          .json({ message: "Cập nhật thành công", data: updatedAccount });
      } else {
        return res.status(404).json({ message: "Tài khoản không tìm thấy" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra.",
        error: error.message,
      });
    }
  },

  updateTTBN1: async (req, res) => {
    try {
      let { _id, benhAn, trangThaiKham } = req.body;

      console.log("id: ", _id);

      let createChucVu = await KhamBenh.updateOne(
        { _id: _id },
        { benhAn, trangThaiKham }
      );

      if (createChucVu) {
        console.log("Chỉnh sửa thành công thông tin khám");
        return res.status(200).json({
          data: createChucVu,
          message: "Chỉnh sửa thông tin khám bác sĩ thành công",
        });
      } else {
        return res.status(404).json({
          message: "Chỉnh sửa thông tin khám bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi Chỉnh sửa tài khoản bác sĩ.",
        error: error.message,
      });
    }
  },

  doanhThu: async (req, res) => {
    try {
      let { trangThaiKham, _idDoctor } = req.body; // Hoặc req.body nếu bạn gửi dữ liệu trong body

      console.log(" trangThaiKham, _idDoctor: ", trangThaiKham, _idDoctor);

      let filter = {};

      if (trangThaiKham !== undefined) {
        // Chuyển 'dakham' thành true và 'chokham' thành false
        if (trangThaiKham === "dakham") {
          filter.trangThaiKham = true; // Đã khám
        } else if (trangThaiKham === "chokham") {
          filter.trangThaiKham = false; // Chưa khám
        }
      }

      if (_idDoctor && ObjectId.isValid(_idDoctor)) {
        // Chuyển _idDoctor thành ObjectId nếu là chuỗi hợp lệ
        _idDoctor = new ObjectId(_idDoctor);
      }

      const orders = await KhamBenh.aggregate([
        {
          // $match: filter
          $match: {
            _idDoctor: _idDoctor, // Truyền chuỗi _idDoctor
            trangThaiKham: trangThaiKham === "dakham" ? true : false,
            trangThaiXacNhan: true,
          },
        },
        {
          $project: {
            totalCaKham: "$totalCaKham", // Tổng ca khám
            status: 1,
          },
        },
        {
          $group: {
            _id: "$_idDoctor", // Nhóm theo bác sĩ (_idDoctor)
            totalCaKham: { $sum: 1 }, // Tính tổng số ca khám (1 đơn hàng = 1 ca khám)
            totalOrders: { $sum: 1 }, // Tổng số đơn hàng thành công (1 đơn hàng = 1)
          },
        },
        {
          $sort: { _id: 1 }, // Sắp xếp theo _idDoctor nếu cần (tức là theo bác sĩ)
        },
      ]);

      console.log("data orders: ", orders);

      res.status(200).json({ data: orders });
    } catch (error) {
      console.error(error); // In ra lỗi chi tiết
      res.status(500).send("Error fetching sales data", error);
    }
  },
};
