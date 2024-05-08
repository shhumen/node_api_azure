const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../models/user')
const validateUser = require('../middleware/validateUser')
const userValidationRules = require('../validations/userValidation')
const authenticationToken = require('../middleware/authenticationToken')
require('dotenv').config()

router.post('/login', validateUser, async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({
        user_id: user._id,
        status: 'failed',
        statusCode: 401,
        message: 'Invalid Username Or Password',
        token: '',
      })
    }

    const tokenOptions = {
      expiresIn: '20d',
      // s saniye, m dakika, h saat, d gün
      // notBefore: '15s', // 15 saniye sonra başlar
      // audience: 'http://localhost:3000', // token hangi sunucuda kullanılacak
      // issuer: 'http://localhost:5001', // token kimin tarafından veriliyor
      // jwtid: 'CodeAcademyTokenId', // token id
      // subject: 'nodejs dersleri için üretilen token, pervinden icaze almadan servisler çalışmaz', // token hangi konuda
      // algorithm: 'HS256' // token hangi algoritmayla şifrelenecek
    }

    const token = jwt.sign(
      {
        userId: user._id,
        // role: 'admin',
        // manager: 'pervin',
        // movzu: 'node.js',
        // date: 'eski date',
        // group:'RADFE203'
      },
      process.env.SECRET_KEY,
      tokenOptions
    )
    res.status(200).send({
      expiresAt: tokenOptions.expiresIn,
      // expire-i date cevirmek lazimdi```
      user_id: user._id,
      status: 'succeeded',
      statusCode: 200,
      message: 'Logged in successfully',
      token: token,
    })
  } catch (err) {
    res.status(400).send({
      status: 'failed',
      statusCode: 400,
      message: err.message,
      token: 'Invalid token',
    })
  }
})

// router.get('/me', authenticationToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId) // Access user ID from JWT
//     if (!user) {
//       return res.status(404).send({ message: 'User not found' })
//     }
//     res.json(user) // Return user data
//   } catch (error) {
//     res.status(500).send({ message: 'Server error' })
//   }
// })

router.get('/me', authenticationToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    const response = {
      user,
      expirationDate: req.user.expirationDate,
      token: req.user.token,
    }

    res.json(response)
  } catch (error) {
    res.status(500).send({ message: 'Server error' })
  }
})

module.exports = router
