// THE SEND MAIL HELPER
//  is a lightweight wrapper arounde the nodemailer module to simplify sending emails from anywhere in the application.
//  Now it is used by the account service to send password reset emails.

const nodemailer = require("nodemailer");
const config = require("../config.json");

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.sendMail({ from, to, subject, html });
}