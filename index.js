const express = require('express');
const app = express();
const port = 3000;
const nodemailer = require('nodemailer');

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.get('/sendmail', (req, res) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'aubree.wilderman@ethereal.email',
            pass: 'nPVUxQjTp6xF93FBRD'
        }
    });

    const mailOptions = {
        from: 'aun',
        to: 'aunmuhammad6307@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!',
        html: '<h1>Welcome</h1><p>That was easy!</p>'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.send('Error');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent: ' + info.response);
        }
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    }
);