const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const sendMail = require('../services/mailService')
const User = require('../models/user')
const getUser = require('../middleware/getUser')
const userValidationRules = require('../validations/userValidation')
const validateUser = require('../middleware/validateUser')
const MailTemplate = require('../templates/mailTemplate')
const otpGenerator = require('otp-generator')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY)
const OTP = require('../models/otpModel')
const validator = require('validator')

require('dotenv').config()

const isPhoneNumberValid = (phoneNumber) => {
  // Implement your custom phone number validation logic here
  // For example, you can use regex to validate phone number format
  // This is just a simple example, you may need to adjust it based on your requirements
  const phoneNumberRegex = /^\d{10}$/ // Assuming phone number should be exactly 10 digits
  return phoneNumberRegex.test(phoneNumber)
}

router.get('/', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const pendingUsers = {}

router.post('/', userValidationRules(), validateUser, async (req, res) => {
  try {
    const {
      password,
      confirmPassword,
      firstname,
      phone,
      lastname,
      email,
      role,
    } = req.body

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: 'All fields are required',
      })
    }

    if (!isPhoneNumberValid(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      })
    }

    let hashedPassword
    let confirmHashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 10)
      confirmHashedPassword = await bcrypt.hash(confirmPassword, 10)
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Hashing password error for ${password}: ` + error.message,
      })
    }

    pendingUsers[email] = {
      password: hashedPassword,
      confirmPassword: confirmHashedPassword,
      firstname,
      lastname,
      email,
      phone,
      role,
    }

    const otp = await generateOTP()

    await sendOTP(email, otp)

    await OTP.create({ email, otp })

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please verify your email with OTP',
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
})

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: 'Both email and otp required for OTP verification',
      })
    }
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      })
    }

    const userDetails = pendingUsers[email]

    await User.create({
      firstname: userDetails.firstname,
      lastname: userDetails.lastname,
      password: userDetails.password,
      phone: userDetails.phone,
      confirmPassword: userDetails.confirmPassword,
      email: userDetails.email,
      role: userDetails.role,
    })

    delete pendingUsers[email]

    await OTP.deleteMany({ email })

    return res.status(200).json({
      success: true,
      message: 'User registered successfully. Your account is now activated.',
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
})

async function generateOTP() {
  try {
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    let result = await OTP.findOne({ otp: otp })
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      })
      result = await OTP.findOne({ otp: otp })
    }
    return otp
  } catch (error) {
    console.log(error.message)
    throw error
  }
}
async function sendOTP(email, otp) {
  try {
    const otpPayload = { email, otp }
    await OTP.create(otpPayload)
    return {
      success: true,
      message: 'OTP sent successfully',
      otp,
    }
  } catch (error) {
    console.log(error.message)
    throw error
  }
}

router.patch('/:id', getUser, async (req, res) => {
  try {
    const allowedUpdates = [
      'firstname',
      'lastname',
      'email',
      'phone',
      'password',
    ]
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    )

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' })
    }

    // Custom phone number validation
    if (req.body.phone && !isPhoneNumberValid(req.body.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      })
    }

    updates.forEach((update) => (res.user[update] = req.body[update]))
    const updatedUser = await res.user.save()
    res
      .status(200)
      .json({ updatedUser, message: 'Changes updated successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res
      .status(200)
      .json({ message: 'User deleted successfully', deletedUserId: user._id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
