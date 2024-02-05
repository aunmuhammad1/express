const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const session = require('express-session');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

const accountSid = 'AC6fb90ceaf271a4db8d8efe17a28737e1';
const authToken = '853c1f204c57f85ae0b83545728d02b2';
const verifySid = 'VAda24070c32aef5bc9d6ff232f7c6b4c2';
const client = twilio(accountSid, authToken);

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #f4f4f4;
                    }
                    form {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    }
                    label {
                        font-weight: bold;
                        display: block;
                        margin-bottom: 5px;
                    }
                    input[type="text"] {
                        width: 100%;
                        padding: 10px;
                        margin-bottom: 10px;
                        border-radius: 4px;
                        border: 1px solid #ddd;
                    }
                    input[type="submit"] {
                        background-color: #007BFF;
                        color: #fff;
                        border: none;
                        border-radius: 4px;
                        padding: 10px 15px;
                        cursor: pointer;
                    }
                    input[type="submit"]:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <form action="/send-otp" method="post">
                    <label for="phone">Phone Number:</label>
                    <input type="text" id="phone" name="phone" required>
                    <input type="submit" value="Send OTP">
                </form>
                <form action="/verify-otp" method="post">
                    <label for="otp">OTP:</label>
                    <input type="text" id="otp" name="otp" required>
                    <input type="submit" value="Verify OTP">
                </form>
            </body>
        </html>
    `);
});

app.post('/send-otp', (req, res) => {
    const phone = req.body.phone;
    req.session.phone = phone; // store the phone number in the session

    client.verify.services(verifySid)
        .verifications.create({ to: phone, channel: 'sms' })
        .then((verification) => {
            console.log(verification.status);
            res.send('OTP sent successfully');
        })
        .catch((err) => {
            console.error(err);
            res.send('Failed to send OTP');
        });
});

app.post('/verify-otp', (req, res) => {
    const phone = req.session.phone; // retrieve the phone number from the session
    const otpCode = req.body.otp;

    client.verify.services(verifySid)
        .verificationChecks.create({ to: phone, code: otpCode })
        .then((verification_check) => {
            console.log(verification_check.status);
            if (verification_check.status === 'approved') {
                res.send('OTP verified successfully');
            } else {
                res.send('Invalid OTP');
            }
        })
        .catch((err) => {
            console.error(err);
            res.send('Failed to verify OTP');
        });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});