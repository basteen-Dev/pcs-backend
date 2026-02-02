const db = require("../models");
const otp_table = db.otp;


exports.otpGenerate = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.uniqueOTPCompo = async (user_id, phone_number, maxAttempts = 5) => {
    try {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const _generatedOTP = this.otpGenerate();

            const existingOtp = await otp_table.findOne({ where: { otp: _generatedOTP } });

            if (!existingOtp) {
                await otp_table.create({
                    otp: _generatedOTP,
                    user_id: user_id,
                    phone_number: phone_number,
                });
                return _generatedOTP;
            }
        }
        throw new Error("Failed to generate a unique OTP after multiple attempts.");
    } catch (e) {
        throw e;
    }
};

