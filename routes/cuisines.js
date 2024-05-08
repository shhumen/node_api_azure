const express = require('express')
const router = express.Router()
const authenticationToken = require('../middleware/authenticationToken')
const Cuisine = require('../models/cuisine')

router.get('/', async (req, res) => {
  try {
    const cuisines = await Cuisine.find()
    res.json(cuisines)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

router.post('/', authenticationToken, async (req, res) => {
  const { cuisineName } = req.body

  try {
    const newCuisine = new Cuisine({
      cuisineName,
    })
    const savedCuisine = await newCuisine.save()
    return res.status(201).json(savedCuisine)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
