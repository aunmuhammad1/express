require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Google Drive API imports
const { google } = require('googleapis');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

// app setup
const app = express();
app.use(bodyParser.json());

// awt autherization for google drive
async function authorize(){
  const jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    SCOPE
  );
  await jwtClient.authorize();
  return jwtClient;
}

async function uploadFile(authClient, filePath, originalName) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: 'v3', auth: authClient });
    var fileMetaData = {
      name: originalName,    
      parents: ['1w61H2wrd6bAsHOy2gjDr7wkTzS5WrbZQ'] // A folder ID to which file will get uploaded
    };
    drive.files.create({
      resource: fileMetaData,
      media: {
        body: fs.createReadStream(filePath), // File that will get uploaded
        mimeType: 'text/plain'
      },
      fields: 'id'
    }, function (error, file) {
      if (error) {
        return reject(error);
      }
      resolve(file);
    });
  });
}

// Endpoint to upload files to Google Drive
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  authorize().then(authClient => {
    return uploadFile(authClient, req.file.path, req.file.originalname);
  }).then(file => {
    res.send(`File was uploaded successfully. File ID: ${file.data.id}`);
  }).catch(error => {
    console.error('Failed to upload file:', error);
    res.status(500).send('Failed to upload file.');
  });
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

// Route for home page
app.get('/', (req, res) => {
  res.send('Hello World');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
