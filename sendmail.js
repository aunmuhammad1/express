const nodemailer = require('nodemailer');

const sendmail = async (req, res) => {  
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'aubree.wilderman@ethereal.email',
            pass: 'nPVUxQjTp6xF93FBRD'
        }
    });

    const info = await transporter.sendMail({
        from: "Aun Muhammad",
        to: "aunmuhammad6307@gmail.com",
        subject: "Hello",
        text: "Hello world",
        html: "<b>Hello world</b>"
    })

    console.log("Message sent: %s", info.messageId);
    res.json(info);
}

module.exports = sendmail;