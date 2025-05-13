const ThoiGianGio = require("../../model/ThoiGianGio");
const fetchAllThoiGianGio = async (req, res) => {
  try {
    const resGio = await ThoiGianGio.find({});
    if (resGio) {
      return res.status(200).json({
        data: resGio,
        message: "Đã tìm ra tất cả thời gian",
      });
    } else {
      return res.status(500).json({
        message: "Có lỗi xảy ra",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi tìm thời gian khám.",
      error: error.message,
    });
  }
};
module.exports = {
  fetchAllThoiGianGio,
};
