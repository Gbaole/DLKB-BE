const mongoose = require("mongoose");

const ThoiGianGio_Schema = new mongoose.Schema(
  {
    tenGio: { type: String },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("ThoiGianGio", ThoiGianGio_Schema);
