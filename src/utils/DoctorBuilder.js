// builder
class DoctorBuilder {
  constructor() {
    this.doctor = {};
  }

  setEmail(email) {
    this.doctor.email = email;
    return this;
  }

  setPassword(password) {
    this.doctor.password = password;
    return this;
  }

  setFirstName(firstName) {
    this.doctor.firstName = firstName;
    return this;
  }

  setLastName(lastName) {
    this.doctor.lastName = lastName;
    return this;
  }

  setAddress(address) {
    this.doctor.address = address;
    return this;
  }

  setPhoneNumber(phoneNumber) {
    this.doctor.phoneNumber = phoneNumber;
    return this;
  }

  setGiaKhamVN(value) {
    this.doctor.giaKhamVN = value;
    return this;
  }

  setGiaKhamNuocNgoai(value) {
    this.doctor.giaKhamNuocNgoai = value;
    return this;
  }

  setChucVuId(chucVuId) {
    this.doctor.chucVuId = chucVuId || [];
    return this;
  }

  setGender(gender) {
    this.doctor.gender = gender;
    return this;
  }

  setImage(image) {
    this.doctor.image = image;
    return this;
  }

  setChuyenKhoaId(chuyenKhoaId) {
    this.doctor.chuyenKhoaId = chuyenKhoaId || [];
    return this;
  }

  setPhongKhamId(phongKhamId) {
    this.doctor.phongKhamId = phongKhamId;
    return this;
  }

  setRoleId(roleId) {
    this.doctor.roleId = roleId;
    return this;
  }

  setMoTa(mota) {
    this.doctor.mota = mota;
    return this;
  }

  build() {
    return this.doctor;
  }
}

module.exports = DoctorBuilder;
