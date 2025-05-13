const { VNPay, ProductCode, VnpLocale, ignoreLogger } = require("vnpay");

const vnpay = new VNPay({
  tmnCode: "4WKUEION",
  secureSecret: "2ZPPJ91HOK6J7JE6G3CUNRPGWJXJ4369",
  vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  testMode: true,
  hashAlgorithm: "SHA512",
  enableLog: true,
  loggerFn: ignoreLogger,
});

module.exports = {
  vnpay,
  ProductCode,
  VnpLocale,
};
