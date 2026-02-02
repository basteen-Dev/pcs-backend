const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const dotenv = require("dotenv");
const { uniqueOTPCompo } = require("../components/unique_otp_compo");
const { default: axios } = require("axios");
const db = require("../models");

const User = db.user;

dotenv.config(); 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

/**
 * Send OTP API
 */
router.post("/send-otp", async (req, res) => {
  const { phone_no } = req.body;

  if (!phone_no) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {



    // const otp = await uniqueOTPCompo(user?.id, phone_no);


    // // Send SMS 
    await axios.post(`http://text.messagewall.in/api/smsapi?key=9be5cacf7c1cebe704fa31b0e38a6906&route=2&sender=THEMSG&number=${phone_no}&templateid=1207161881764124563&sms=Your OTP is ${otp} IMMSMS`);



    // await client.messages.create({
    //   body: `Your OTP is: ${otp}`,
    //   from: twilioPhone,
    //   // to: "+917358495594",
    //   to: phone_no,
    // });

    // // const verification = await client.verify.v2.services(accountSid).verifications.create({
    // //   body: `Your OTP is: ${otp}`,
    // //   channel: 'sms',
    // //   to: "+157358495594",
    // // })



    // Store OTP in session
    req.session.otp = otp;
    req.session.phone_no = phone_no; // Store phone_no for later verification

    res.status(200).json({ status: 200, message: "OTP sent successfully!", otp });

  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});
router.post("/send-message", async (req, res) => {
  const { phone_no, message } = req.body;

  try {
    // await client.messages.create({
    //   body: message,
    //   from: twilioPhone,
    //   to: phone_no,
    // });

    await axios.post(`http://text.messagewall.in/api/smsapi?key=9be5cacf7c1cebe704fa31b0e38a6906&route=2&sender=THEMSG&number=${phone_no}&templateid=1207161881764124563&sms=Your OTP is ${message} IMMSMS`);



    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

module.exports = router;
