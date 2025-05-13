const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  try {
    await transporter.sendMail(options);
    console.log("Email đã được gửi thành công!");
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    throw error;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const sendAppointmentEmail = async (
  email,
  patientName,
  nameDoctor,
  tenGioKham,
  ngayKhamBenh,
  giaKham,
  address,
  phone,
  lidokham,
  stringTrangThaiXacNhan,
  namePK,
  addressPK,
  sdtDoct,
  sdtPK
) => {
  const mailOptions = {
    from: "ADMIN",
    to: email,
    subject: "Xác nhận lịch khám",
    html: `
      <h2>Thông tin lịch khám</h2>
      <table border="1" cellpadding="10">
        <tr>
          <th>Thông tin bệnh nhân</th>
          <th>Thông tin lịch khám</th>
        </tr>
        <tr>
          <td><strong>Tên bệnh nhân:</strong> ${patientName}</td>
          <td><strong>Ngày khám:</strong> ${ngayKhamBenh}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong> ${email}</td>
          <td><strong>Giờ khám:</strong> ${tenGioKham}</td>
        </tr>
        <tr>
          <td><strong>Số điện thoại:</strong> ${phone}</td>
          <td>
            <strong>Bác sĩ:</strong> ${nameDoctor} <br/>
            <strong>Số điện thoại:</strong> ${sdtDoct}
          </td>
        </tr>
        <tr>
          <td><strong>Địa chỉ:</strong> ${address}</td>
          <td><strong>Giá khám:</strong> ${formatCurrency(giaKham)}</td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Tên phòng khám:</strong> ${namePK} <br/>
            <strong>Địa chỉ phòng khám:</strong> ${addressPK} <br/>
            <strong>Số điện thoại phòng khám:</strong> ${sdtPK}
          </td>
        </tr>
        <tr>
          <td colspan="2"><strong>Lí do khám: </strong> ${lidokham}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Trạng thái lịch hẹn: </strong> ${stringTrangThaiXacNhan}</td>
        </tr>
      </table>
      <p>Cảm ơn bạn đã đặt lịch khám tại chúng tôi. Chúng tôi sẽ thông báo trước ngày khám nếu có thay đổi.</p>
    `,
  };

  await sendEmail(mailOptions);
};

const sendAppointmentEmailHuyLich = async (
  email,
  patientName,
  nameDoctor,
  tenGioKham,
  ngayKhamBenh,
  giaKham,
  address,
  phone,
  lidokham,
  stringTrangThaiXacNhan,
  namePK,
  addressPK,
  sdtDoct,
  sdtPK
) => {
  const mailOptions = {
    from: "ADMIN",
    to: email,
    subject: "Lịch khám đã bị hủy vì quá hạn hoặc hết lịch",
    html: `
      <h2>Thông tin lịch khám</h2>
      <table border="1" cellpadding="10">
        <tr>
          <th>Thông tin bệnh nhân</th>
          <th>Thông tin lịch khám</th>
        </tr>
        <tr>
          <td><strong>Tên bệnh nhân:</strong> ${patientName}</td>
          <td><strong>Ngày khám:</strong> ${ngayKhamBenh}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong> ${email}</td>
          <td><strong>Giờ khám:</strong> ${tenGioKham}</td>
        </tr>
        <tr>
          <td><strong>Số điện thoại:</strong> ${phone}</td>
          <td>
            <strong>Bác sĩ:</strong> ${nameDoctor} <br/>
            <strong>Số điện thoại:</strong> ${sdtDoct}
          </td>
        </tr>
        <tr>
          <td><strong>Địa chỉ:</strong> ${address}</td>
          <td><strong>Giá khám:</strong> ${formatCurrency(giaKham)}</td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Tên phòng khám:</strong> ${namePK} <br/>
            <strong>Địa chỉ phòng khám:</strong> ${addressPK} <br/>
            <strong>Số điện thoại phòng khám:</strong> ${sdtPK}
          </td>
        </tr>
        <tr>
          <td colspan="2"><strong>Lí do khám: </strong> ${lidokham}</td>
        </tr>
      </table>
    `,
  };

  await sendEmail(mailOptions);
};

const sendAppointmentEmailBenhAn = async (
  email,
  patientName,
  nameDoctor,
  tenGioKham,
  ngayKhamBenh,
  giaKham,
  address,
  phone,
  lidokham,
  stringTrangThaiKham,
  benhAn,
  namePK,
  addressPK,
  sdtDoct,
  sdtPK
) => {
  const mailOptions = {
    from: "ADMIN",
    to: email,
    subject: "Thông báo kết quả khám và bệnh án",
    html: `
      <h2>Thông tin lịch khám và bệnh án</h2>
      <table border="1" cellpadding="10">
        <tr>
          <th>Thông tin bệnh nhân</th>
          <th>Thông tin lịch khám</th>
        </tr>
        <tr>
          <td><strong>Tên bệnh nhân:</strong> ${patientName}</td>
          <td><strong>Ngày khám:</strong> ${ngayKhamBenh}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong> ${email}</td>
          <td><strong>Giờ khám:</strong> ${tenGioKham}</td>
        </tr>
        <tr>
          <td><strong>Số điện thoại:</strong> ${phone}</td>
          <td>
            <strong>Bác sĩ:</strong> ${nameDoctor} <br/>
            <strong>Số điện thoại bác sĩ:</strong> ${sdtDoct}
          </td>
        </tr>
        <tr>
          <td><strong>Địa chỉ:</strong> ${address}</td>
          <td><strong>Giá khám:</strong> ${formatCurrency(giaKham)}</td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Tên phòng khám:</strong> ${namePK} <br/>
            <strong>Địa chỉ phòng khám:</strong> ${addressPK} <br/>
            <strong>Số điện thoại phòng khám:</strong> ${sdtPK}
          </td>
        </tr>
        <tr>
          <td colspan="2"><strong>Lí do khám: </strong> ${lidokham}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Trạng thái khám: </strong> ${stringTrangThaiKham}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Bệnh án:</strong> ${benhAn}</td>
        </tr>
      </table>
      <p>Cảm ơn bạn đã sử dụng dịch vụ khám chữa bệnh của chúng tôi. Chúng tôi hy vọng bạn sẽ có kết quả tốt và sức khỏe ngày càng tốt hơn.</p>
    `,
  };

  await sendEmail(mailOptions);
};

module.exports = {
  sendAppointmentEmail,
  sendAppointmentEmailHuyLich,
  sendAppointmentEmailBenhAn,
};
