const { body, custom } = require('express-validator')

module.exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email CANNOT be empty')
    .bail()
    .isEmail()
    .withMessage('Email is invalid'),
  body('password').notEmpty().withMessage('Password CANNOT be empty'),
]

const userValidationRules = () => [
  // body('username').not().isEmpty().withMessage('Kullanıcı adı boş olamaz'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Kullanıcı şifresi en az 8 karakter olmalıdır')
    .matches(/\d/)
    .withMessage('Kullanıcı şifresi en az 1 rakam içermelidir')
    .matches(/[a-z]/)
    .withMessage('Kullanıcı şifresi en az 1 küçük harf içermelidir')
    .matches(/[A-Z]/)
    .withMessage('Kullanıcı şifresi en az 1 büyük harf içermelidir')
    .matches(/[\W_]/)
    .withMessage('Kullanıcı şifresi en az 1 özel karakter içermelidir')
    .not()
    .isIn(['123456', 'password', 'qwerty', 'abc123', '123456789', '111111'])
    .trim(),
  // body('password').custom((value, { req }) => {
  //   if (value == req.body.username) {
  //     throw new Error('Kullanıcı adı ve şifre aynı olamaz')
  //   }
  //   return true
  // }),
]

module.exports = userValidationRules
