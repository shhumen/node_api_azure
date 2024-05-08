const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY)

const nodemailer = require('nodemailer')

const verifyMailSender = async (email, title, body) => {
  try {
    // Create a Transporter to send emails
    let verificationTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASS,
      },
    })
    // Send emails to users
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

// async function sendMail(to, id, subject, text) {
//   try {
//     // SMTP sunucu ayarları
//     let transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.MAIL_USERNAME,
//         pass: process.env.MAIL_PASS,
//       },
//     })

//     const encryptedId = cryptr.encrypt(id)
//     const link = `${process.env.BASE_URL}/users/verify/${encryptedId}`
//     // E-posta gönderme ayarları
//     let info = await transporter.sendMail({
//       from: '"Shumen Mehdiyeva" mehtiyevashumen@gmail.com',
//       to: to, // Gönderilecek kişi
//       subject: subject, // E-posta konusu
//       text: text, // E-posta içeriği (text formatı)
//       html: `Hello, please click on the link to verify your mail. <a href="${link}">Click here to verify</a> `, // E-posta içeriği (html formatı)
//     })

//     console.log('Email sent: %s', info.messageId)
//   } catch (err) {
//     console.log(err)
//   }
// }

// module.exports = sendMail
