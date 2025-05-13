const CauHoi = require("../../model/CauHoi");
const Doctor = require("../../model/Doctor");
const nodemailer = require("nodemailer");

module.exports = {
  createCauHoi: async (req, res) => {
    try {
      const { email, firstName, lastName, chuyenKhoaId, cauHoi } = req.body;

      // Kiểm tra và tạo câu hỏi mới
      const newCauHoi = new CauHoi({
        email,
        firstName,
        lastName,
        chuyenKhoaId,
        cauHoi,
      });

      // Lưu câu hỏi vào database
      await newCauHoi.save();

      return res.status(201).json({
        message:
          "Câu hỏi đã được tạo thành công! Câu trả lời sẽ được gửi tới email của bạn!",
        data: newCauHoi,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi khi tạo câu hỏi", error: error.message });
    }
  },

  // Controller lấy câu hỏi theo bác sĩ
  getCauHoi: async (req, res) => {
    try {
      const { idDoctor, search, page, limit, sort, order } = req.query;

      console.log(
        "idDoctor, search, page, limit: ",
        idDoctor,
        search,
        page,
        limit
      );

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

      // Tìm bác sĩ theo ID
      const doctor = await Doctor.findById(idDoctor);

      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại." });
      }

      // Lấy chuyên khoa của bác sĩ
      const chuyenKhoaId = doctor.chuyenKhoaId;

      console.log("chuyenKhoaId: ", chuyenKhoaId);

      // Tạo điều kiện tìm kiếm
      const query = {
        chuyenKhoaId: { $in: chuyenKhoaId }, // Sử dụng $in để tìm các câu hỏi có chuyên khoa trùng
      };

      // Nếu có tìm kiếm theo từ khóa, thêm điều kiện vào query
      if (search) {
        query.cauHoi = { $regex: search, $options: "i" }; // Tìm kiếm theo câu hỏi, không phân biệt chữ hoa/thường
      }

      const questions = await CauHoi.find(query)
        .skip(skip) // Bỏ qua các câu hỏi trước đó
        .limit(limit) // Lấy số lượng câu hỏi theo trang
        .sort({ [sort]: sortOrder })
        .exec(); // Thực thi truy vấn

      // Lấy tổng số câu hỏi để tính toán tổng số trang
      const totalQuestions = await CauHoi.countDocuments(query);

      // Tính toán tổng số trang
      const totalPages = Math.ceil(totalQuestions / limit);

      if (questions.length > 0) {
        return res.status(200).json({
          message: "Tìm thấy câu hỏi.",
          data: questions,
          totalQuestions, // Tổng số câu hỏi tìm được
          totalPages, // Tổng số trang
          currentPage: page, // Trang hiện tại
        });
      } else {
        return res
          .status(404)
          .json({ message: "Không có câu hỏi nào thuộc chuyên khoa này." });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy câu hỏi", error: error.message });
    }
  },

  traLoiCauHoi: async (req, res) => {
    try {
      let {
        _id,
        cauTraLoi,
        cauHoi,
        status,
        email,
        firstName,
        lastName,
        idDoctor,
      } = req.body;

      // Cập nhật câu hỏi
      let update = await CauHoi.findByIdAndUpdate(
        { _id: _id },
        { cauTraLoi, cauHoi, status, doctors: idDoctor },
        { new: true }
      );

      if (update) {
        // Tạo nội dung email
        const mailOptions = {
          from: "Bác sĩ", // Địa chỉ email gửi
          to: email, // Địa chỉ email nhận
          subject: "Trả lời câu hỏi của bạn", // Tiêu đề email
          html: `
                        <html>
                            <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f9; padding: 20px;">
                                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                    <h2 style="color: #4CAF50;">Chào ${firstName} ${lastName},</h2>

                                    <p style="font-size: 16px; line-height: 1.6;">
                                        <strong>Câu hỏi của bạn:</strong><br>
                                        <em style="color: #555;">${cauHoi}</em>
                                    </p>

                                    <p style="font-size: 16px; line-height: 1.6;">
                                        <strong>Câu trả lời:</strong><br>
                                        <span style="color: #555;">${cauTraLoi}</span>
                                    </p>

                                    <p style="font-size: 16px; line-height: 1.6;">
                                        <strong>Trạng thái:</strong> 
                                        <span style="color: ${
                                          status ? "#4CAF50" : "#FF5722"
                                        };">
                                            ${
                                              status
                                                ? "Đã trả lời"
                                                : "Chưa trả lời"
                                            }
                                        </span>
                                    </p>

                                    <p style="font-size: 16px; line-height: 1.6;">
                                        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                                    </p>

                                    <footer style="margin-top: 30px; font-size: 14px; color: #777; text-align: center;">
                                        <p>&copy; 2024 Bác sĩ - Tất cả quyền lợi thuộc về chúng tôi</p>
                                    </footer>
                                </div>
                            </body>
                        </html>`,
        };

        // Tạo transporter cho Nodemailer
        const transporter = nodemailer.createTransport({
          service: "gmail", // Dùng Gmail để gửi email
          auth: {
            user: "quanthqdev@gmail.com", // Địa chỉ email gửi
            pass: "jiotxdnucyulkxoh", // Mật khẩu email hoặc sử dụng ứng dụng mật khẩu nếu dùng Gmail
          },
        });

        // Gửi email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({
              message: "Lỗi khi gửi email",
              error: error.message,
            });
          }
          return res.status(200).json({
            data: update,
            message:
              "Trả lời câu hỏi cho bệnh nhân thành công và email đã được gửi",
          });
        });
      } else {
        return res.status(404).json({
          message: "Trả lời câu hỏi cho bệnh nhân thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi khi trả lời câu hỏi", error: error.message });
    }
  },

  getAllCauHoi: async (req, res) => {
    try {
      const { page, limit, order, sort, locTheoChuyenKhoa } = req.query;

      // Chuyển đổi thành số
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Tính toán số bản ghi bỏ qua
      const skip = (pageNumber - 1) * limitNumber;

      let query = {};

      // Tìm kiếm theo IdLoaiSP nếu có
      if (locTheoChuyenKhoa) {
        // Chuyển 'locTheoChuyenKhoa' từ string sang mảng ObjectId
        const locTheoChuyenKhoaArray = Array.isArray(locTheoChuyenKhoa)
          ? locTheoChuyenKhoa
          : JSON.parse(locTheoChuyenKhoa);

        query.chuyenKhoaId = { $in: locTheoChuyenKhoaArray }; // Dùng toán tử $in để lọc theo mảng các ObjectId
      }

      // Tìm các câu hỏi đã có câu trả lời
      query.cauTraLoi = { $ne: null }; // Trường cauTraLoi không phải null hoặc undefined
      query.status = true;

      // tang/giam
      let sortOrder = 1; // tang dn
      if (order === "desc") {
        sortOrder = -1;
      }

      // Tìm bác sĩ theo ID
      const cauHoi = await CauHoi.find(query)
        .populate("chuyenKhoaId doctors")
        .populate({
          path: "doctors", // Populating `doctors`
          model: "Doctor", // Đảm bảo rằng bạn đã định nghĩa model 'Doctor'
          populate: {
            // Nếu bạn muốn populate thêm các trường trong bác sĩ
            path: "chucVuId", // Populating `chucVuId` trong schema Doctor
            model: "ChucVu", // Chắc chắn bạn đã định nghĩa model `ChucVu`
          },
        })
        .sort({ [sort]: sortOrder });

      if (cauHoi) {
        return res.status(200).json({
          message: "Tìm thấy all câu hỏi.",
          data: cauHoi,
        });
      } else {
        return res.status(404).json({ message: "Không có câu hỏi nào" });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy câu hỏi", error: error.message });
    }
  },
};
