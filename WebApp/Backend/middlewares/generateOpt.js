const generateOtp = (req, res) => {
  const otpLength = 6;
  let otp = "";

  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 9) + 1;
  }

  return otp;
};

module.exports = generateOtp;
