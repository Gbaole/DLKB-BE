const bcrypt = require("bcrypt");
//Template method

class BaseRegisterService {
  async register(data) {
    this.validateInput(data);

    const existed = await this.checkEmailExists(data.email);
    if (existed)
      throw new Error("Tài Khoản Đã Tồn Tại! Vui Lòng Chọn Email Khác!");

    const hashedPassword = await this.hashPassword(data.password);
    const newUser = await this.saveToDatabase({
      ...data,
      password: hashedPassword,
    });

    await this.afterSave(newUser);
    return newUser;
  }

  validateInput(data) {
    throw new Error("Bạn phải implement validateInput trong subclass");
  }

  async checkEmailExists(email) {
    throw new Error("Bạn phải implement checkEmailExists trong subclass");
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async saveToDatabase(userData) {
    throw new Error("Bạn phải implement saveToDatabase trong subclass");
  }

  async afterSave(user) {}
}

module.exports = BaseRegisterService;
