//Strategy
class FeeStrategy {
  calculateFee() {
    throw new Error("Phải override method calculateFee()");
  }
}

class VietNamPatientFee extends FeeStrategy {
  calculateFee() {
    return 200000;
  }
}

class ForeignPatientFee extends FeeStrategy {
  calculateFee() {
    return 500000;
  }
}

module.exports = {
  VietNamPatientFee,
  ForeignPatientFee,
};
