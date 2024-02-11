require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');

// Google Drive API imports
const { google } = require('googleapis');
const googleapi = require('./googledriveapi.json');

// app setup
const app = express();
app.use(bodyParser.json());
const upload = multer({ dest: 'uploads/' });

// Google Drive API setup
const drive = google.drive({
    version: 'v3',
    auth: new google.auth.GoogleAuth({
      keyFile: {
        "type": "service_account",
        "project_id": process.env.PROJECT_ID,
        "private_key_id": process.env.PRIVATE_KEY_ID,
        "private_key": process.env.PRIVATE_KEY,
        "client_email": process.env.CLIENT_EMAIL,
        "client_id": process.env.CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url" : process.env.CLIENT_X509_CERT_URL,
        "universe_domain": "googleapis.com"
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'], // Scope for uploading files
    }),
});

// mongoDB setup
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// OTP model
const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }, // OTP expires after 300 seconds (5 minutes)
});
const OTP = mongoose.model('OTP', otpSchema);

// Route for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const response = await uploadFileToDrive(filePath, req.file.originalname);
        fs.unlinkSync(filePath); // Delete the file from the server after upload
        res.send({ success: true, fileId: response.data.id, message: "File uploaded successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Failed to upload file." });
    }
});

// Function to upload file to Google Drive
async function uploadFileToDrive(filePath, originalName) {
    const fileMetadata = {
        name: originalName,
        // Specify the parent folder ID if you want to upload it to a specific folder
        parents: [process.env.FLODER_ID], // Replace with your folder ID
    };
    const media = {
        mimeType: 'application/octet-stream', // Change as per your file type
        body: fs.createReadStream(filePath),
    };
    return await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
    });
}

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
    from: 'admin@daroo-time.com',
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
