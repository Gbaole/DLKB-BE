const BaseRegisterService = require("./BaseRegisterService");
const BenhNhan = require("../model/BenhNhan");

//Template method
class BenhNhanRegisterService extends BaseRegisterService {
  validateInput(data) {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc.");
    }
  }

  async checkEmailExists(email) {
    return await BenhNhan.findOne({ email });
  }

  async saveToDatabase(userData) {
    const { email, password, firstName, lastName, phone, image, address } =
      userData;
    return await BenhNhan.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      image,
      address,
    });
  }

  async afterSave(user) {
    console.log("Đăng ký bệnh nhân thành công:", user.email);
  }
}

module.exports = BenhNhanRegisterService;
