const KhamBenh = require("../../model/KhamBenh");
const Doctor = require("../../model/Doctor");
const {
  sendAppointmentEmail,
  sendAppointmentEmailHuyLich,
} = require("../../utils/emailUtils");

// API đặt lịch khám
const datLichKham = async (req, res) => {
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
        return res.status(400).json({
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
};

// API đặt lịch khám với VNPay
const datLichKhamTTVNPay = async (req, res) => {
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
        return res.status(400).json({
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

    return res.status(200).json({
      message: "Đặt lịch khám thành công!",
      data: datlich,
      paymentUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra!", error });
  }
};

// API lấy lịch hẹn
const getLichHen = async (req, res) => {
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
};

// API tìm tất cả lịch hẹn
const findAllLichHen = async (req, res) => {
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
};

// API tìm tất cả lịch hẹn theo bác sĩ
const findAllLichHenByDoctor = async (req, res) => {
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
};

// API hủy lịch hẹn
const handleHuyOrder = async (req, res) => {
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
};

// API xóa lịch hẹn
const deleteLichHen = async (req, res) => {
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
};

// API xác nhận lịch hẹn
const xacNhanLich = async (req, res) => {
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

      return res.status(200).json({
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
};

// Xuất các API
module.exports = {
  datLichKham,
  datLichKhamTTVNPay,
  getLichHen,
  findAllLichHen,
  findAllLichHenByDoctor,
  handleHuyOrder,
  deleteLichHen,
  xacNhanLich,
};
