let nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "tp2.pwi@gmail.com",
        pass: "passwd_123"
    }
});





module.exports = transporter;