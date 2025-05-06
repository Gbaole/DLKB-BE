const mongoose = require("mongoose");
const ThoiGianGio = require("./ThoiGianGio");
const defaultRoleId = new mongoose.Types.ObjectId("66df1d6fdcb551b86e4f703b");
const defaultChucVuId = new mongoose.Types.ObjectId("66f7b888ce6c5cdcb1cab057");
const Doctor_Schema = new mongoose.Schema(
  {
    email: { type: String },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    giaKhamVN: { type: String },
    giaKhamNuocNgoai: { type: String },
    chucVuId: [
      {
        ref: "ChucVu",
        type: mongoose.SchemaTypes.ObjectId,
        default: defaultChucVuId,
      },
    ],
    gender: { type: Boolean },
    image: { type: String },
    chuyenKhoaId: [{ ref: "ChuyenKhoa", type: mongoose.SchemaTypes.ObjectId }],
    phongKhamId: { ref: "PhongKham", type: mongoose.SchemaTypes.ObjectId },
    roleId: {
      ref: "Role",
      type: mongoose.SchemaTypes.ObjectId,
      default: defaultRoleId,
    },
    mota: { type: String },
    thoiGianKham: [
      {
        date: { type: String, required: true }, // Ngày khám
        thoiGianId: [
          { ref: "ThoiGianGio", type: mongoose.SchemaTypes.ObjectId },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

Doctor_Schema.methods.removeExpiredTimeSlots = async function () {
  const currentDate = new Date();
  const currentTimeInMinutes =
    currentDate.getHours() * 60 + currentDate.getMinutes();

  console.log("currentDate: ", currentDate);
  console.log("currentTimeInMinutes: ", currentTimeInMinutes);

  for (const slot of this.thoiGianKham) {
    const thoiGianGioList = await ThoiGianGio.find({
      _id: { $in: slot.thoiGianId },
    });

    // Lọc các giờ khám không còn hợp lệ
    slot.thoiGianId = slot.thoiGianId.filter((thoiGianId) => {
      const thoiGianGio = thoiGianGioList.find((gio) =>
        gio._id.equals(thoiGianId)
      );
      if (thoiGianGio) {
        const [start, end] = thoiGianGio.tenGio.split(" - ").map((t) => {
          const [hour, minute] = t.split(":").map(Number);
          return hour * 60 + minute;
        });

        // Lấy ngày của lịch khám (theo kiểu YYYY-MM-DD)
        const thoiGianGioDate = new Date(slot.date);
        thoiGianGioDate.setHours(0, 0, 0, 0);

        // So sánh ngày
        const currentDateOnly = new Date();
        currentDateOnly.setHours(0, 0, 0, 0);

        // Nếu ngày hiện tại > ngày khám hoặc ngày hiện tại = ngày khám nhưng giờ khám đã qua, xóa lịch khám
        if (thoiGianGioDate < currentDateOnly) {
          return false; // Lịch khám đã qua
        } else if (
          thoiGianGioDate.getTime() === currentDateOnly.getTime() &&
          end <= currentTimeInMinutes
        ) {
          return false; // Lịch khám trong hôm nay nhưng đã qua giờ
        }

        return true;
      }
      return false;
    });
  }

  // Lọc những ngày không còn giờ khám nào
  this.thoiGianKham = this.thoiGianKham.filter(
    (slot) => slot.thoiGianId.length > 0
  );
};

// Trước khi lưu, gọi hàm removeExpiredTimeSlots
Doctor_Schema.pre("save", async function (next) {
  await this.removeExpiredTimeSlots();
  next();
});

module.exports = mongoose.model("Doctor", Doctor_Schema);
