const bcrypt = require("bcrypt");
const Doctor = require("../../model/Doctor");
const ThoiGianGio = require("../../model/ThoiGianGio");
const PhongKham = require("../../model/PhongKham");
require("dotenv").config();
const mongoose = require("mongoose");
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
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Gửi email thông báo

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

// API bác sĩ
const fetchAllDoctor = async (req, res) => {
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
};
const fetchDoctorById = async (req, res) => {
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
};
const fetchDoctorByNgayGio = async (req, res) => {
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
};
const fetchDoctorByChuyenKhoa = async (req, res) => {
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
};
const fetchAllDoctorById = async (req, res) => {
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
};
const fetchDoctorByPhongKham = async (req, res) => {
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
};
const createDoctor = async (req, res) => {
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
};
const updateDoctor = async (req, res) => {
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
};
const deleteDoctor = async (req, res) => {
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
};

// API thời gian khám
const addTimeKhamBenhDoctor = async (req, res) => {
  const { date, time, _id } = req.body;

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
    return res.status(200).json({
      message: "Cập nhật lịch trình khám bệnh thành công!",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra!", error });
  }
};

const deleteOldTimeSlots = async (req, res) => {
  const { _id } = req.body; // Lấy _id từ body
  console.log("_id: ", _id);

  try {
    // Tìm bác sĩ theo ID
    const doctor = await Doctor.findById(_id);
    if (!doctor) {
      return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
    }

    // Lọc các lịch trình đã qua
    const oldSlots = doctor.thoiGianKham.filter((slot) =>
      moment(slot.date).isBefore(moment(), "day")
    );

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

    return res.status(200).json({
      message: "Đã xóa các lịch trình cũ thành công!",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra!", error });
  }
};
const getTimeSlotsByDoctorAndDate = async (req, res) => {
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
      return res.status(200).json({
        message: "Không có thời gian khám cho ngày này!",
        timeSlots: [],
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra!", error });
  }
};

// API cập nhật thông tin bệnh nhân
const updateTTBN = async (req, res) => {
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
};

// -------------------- Xuất các API --------------------
module.exports = {
  fetchAllDoctor,
  fetchDoctorById,
  fetchDoctorByNgayGio,
  fetchDoctorByChuyenKhoa,
  fetchAllDoctorById,
  fetchDoctorByPhongKham,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  addTimeKhamBenhDoctor,
  deleteOldTimeSlots,
  getTimeSlotsByDoctorAndDate,
  updateTTBN,
};
