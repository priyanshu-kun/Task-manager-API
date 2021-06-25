require('dotenv').config();
const nodemailer = require("nodemailer");

const sendingMail = ({ email, name, title, body }) => {
    // console.log("*** User ***", User)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    let mailOptions = {
        from: "priyanshushrama709@gmail.com",
        to: email,
        subject: title,
        text: `Dear ${name} - ${body}`
    }

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) return console.error(err);
        console.log("Boom: ", data);
    })
}

module.exports = sendingMail;