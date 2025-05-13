const mongoose = require("mongoose");

const CauHoi_Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    chuyenKhoaId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChuyenKhoa",
        required: true,
      },
    ],
    cauHoi: {
      type: String,
      required: true,
    },
    cauTraLoi: {
      type: String,
    },
    doctors: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CauHoi", CauHoi_Schema);
