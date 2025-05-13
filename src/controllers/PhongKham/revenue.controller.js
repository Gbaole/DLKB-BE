const KhamBenh = require("../../model/KhamBenh");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const doanhThu = async (req, res) => {
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
};
module.exports = {
  doanhThu,
};
