const express = require('express')
const router = express.Router()
const authenticationToken = require('../middleware/authenticationToken')
const PeriodEnum = require('../models/utils/periodEnum')

router.post('/', async (req, res) => {
  try {
    const periodEnum = await PeriodEnum.create(req.body)
    res.status(201).json(periodEnum)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router
