const BenhNhan = require("../model/BenhNhan");
const BacSi = require("../model/Doctor");

class UserFactory {
  static async createUser(type, data) {
    switch (type) {
      case "benhnhan":
        return BenhNhan.create(data);
      case "bacsi":
        return BacSi.create(data);
      default:
        throw new Error("Invalid user type");
    }
  }
}

module.exports = UserFactory;
