require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }, // OTP expires after 300 seconds (5 minutes)
});
const OTP = mongoose.model('OTP', otpSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// API endpoint to send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Your OTP',
    text: `Your OTP is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    await OTP.create({ email, otp });
    res.send('OTP sent to your email');
  } catch (error) {
    res.status(500).send('Error sending OTP');
  }
});

// API endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const foundOTP = await OTP.findOne({ email, otp });

  if (foundOTP) {
    res.send('OTP verified successfully');
  } else {
    res.status(400).send('Invalid OTP');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
