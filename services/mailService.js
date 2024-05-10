const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY)

const nodemailer = require('nodemailer')

const verifyMailSender = async (email, title, body) => {
  try {
    let verificationTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASS,
      },
    })
    let info = await verificationTransporter.sendMail({
      from: '"DineSpot Reservation" mehtiyevashumen@gmail.com',
      to: email,
      subject: title,
      html: body,
    })
    console.log('Email info: ', info)
    return info
  } catch (error) {
    console.log(error.message)
  }
}
module.exports = verifyMailSender
