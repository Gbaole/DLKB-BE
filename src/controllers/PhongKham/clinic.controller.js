const ChuyenKhoa = require("../../model/ChuyenKhoa");
const ChucVu = require("../../model/ChucVu");
const PhongKham = require("../../model/PhongKham");

// API lấy tất cả chuyên khoa
const fetchAllChuyenKhoa = async (req, res) => {
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
};

// API lấy chuyên khoa theo ID
const fetchChuyenKhoaByID = async (req, res) => {
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
};

// API lấy tất cả chức vụ
const fetchAllChucVu = async (req, res) => {
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
};

// API lấy tất cả phòng khám
const fetchAllPhongKham = async (req, res) => {
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
};

// API tạo chuyên khoa
const createChuyenKhoa = async (req, res) => {
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
};

// API tạo chức vụ
const createChucVu = async (req, res) => {
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
};

// API tạo phòng khám
const createPhongKham = async (req, res) => {
  try {
    let { name, address, description, image, sdtPK } = req.body;
    console.log("anhr: ", image);

    if (!name || !address) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin (tên phòng khám, địa chỉ)",
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
};

// API cập nhật chuyên khoa
const updateChuyenKhoa = async (req, res) => {
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
};

// API cập nhật chức vụ
const updateChucVu = async (req, res) => {
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
};

// API cập nhật phòng khám
const updatePhongKham = async (req, res) => {
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
};

// API xóa chuyên khoa
const deleteChuyenKhoa = async (req, res) => {
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
};

// API xóa chức vụ
const deleteChucVu = async (req, res) => {
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
};

// API xóa phòng khám
const deletePhongKham = async (req, res) => {
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
};
module.exports = {
  fetchAllChuyenKhoa,
  fetchChuyenKhoaByID,
  fetchAllChucVu,
  fetchAllPhongKham,
  createChuyenKhoa,
  createChucVu,
  createPhongKham,
  updateChuyenKhoa,
  updateChucVu,
  updatePhongKham,
  deleteChuyenKhoa,
  deleteChucVu,
  deletePhongKham,
};
