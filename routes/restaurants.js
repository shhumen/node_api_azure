const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Restaurants = require('../models/restaurants')
const User = require('../models/user')
const getRestaurant = require('../middleware/getRestaurant')
const authenticationToken = require('../middleware/authenticationToken')
const upload = require('../services/upload')
const Cuisine = require('../models/cuisine')
const ObjectId = mongoose.Types.ObjectId
const bcrypt = require('bcryptjs')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY)

router.get('/', async (req, res) => {
  const rests = Restaurants.find()
  try {
    let matchQuery = {}

    if (req.query.acceptingYums) {
      matchQuery['acceptsYums'] = true
    } // islemir

    if (req.query.street) {
      matchQuery['address.street'] = req.query.street
    }

    if (req.query.priceMin || req.query.priceMax) {
      matchQuery['price'] = {}
      if (req.query.priceMin) {
        matchQuery['price'].$gte = parseFloat(req.query.priceMin)
      }
      if (req.query.priceMax) {
        matchQuery['price'].$lte = parseFloat(req.query.priceMax)
      }
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i')
      matchQuery['$or'] = [
        { restaurantName: searchRegex },
        { description: searchRegex },
      ]
    }
    const sortOrder = req.query.rating === 'desc' ? -1 : 1

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || (await rests).length

    const skip = (page - 1) * limit

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'PeriodTimes',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'availableTimes',
        },
      },
      {
        $lookup: {
          from: 'Cuisines',
          localField: 'cuisines',
          foreignField: '_id',
          as: 'cuisines',
        },
      },
      {
        $lookup: {
          from: 'RatingAndReview',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          ratingsCount: { $size: '$reviews' },
          totalRating: {
            $cond: {
              if: { $eq: ['$ratingsCount', 0] },
              then: 0,
              else: { $sum: '$reviews.rating' },
            },
          },
        },
      },
      {
        $addFields: {
          averageRating: {
            $round: [
              {
                $cond: {
                  if: { $eq: ['$ratingsCount', 0] },
                  then: 0,
                  else: { $divide: ['$totalRating', '$ratingsCount'] },
                },
              },
              1,
            ],
          },
        },
      },
      { $sort: { averageRating: sortOrder } },
      { $skip: skip },
      { $limit: limit },
    ]

    const restaurants = await Restaurants.aggregate(pipeline)

    res.json(restaurants)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/addresses', async (req, res) => {
  try {
    const addresses = await Restaurants.find({}, { address: 1, _id: 0 })
    res.json(addresses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', authenticationToken, async (req, res) => {
  const {
    firstname,
    lastname,
    phone,
    email,
    password,
    confirmPassword,
    role,
    restaurantName,
    description,
    address,
    cuisines: cuisineIds,
    openingHours,
    ratingsAndReviews,
    features,
    // image,
    promotions,
    paymentMethods,
    dietaryOptions,
    awards,
  } = req.body

  try {
    const existingRestaurant = await Restaurants.findOne({ restaurantName })
    if (existingRestaurant) {
      return res.status(400).json({ error: 'Restaurant already exists' })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' })
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

    const newUser = new User({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      confirmPassword: confirmHashedPassword,
      role: 'restaurant',
    })

    const savedUser = await newUser.save()

    // if (
    //   typeof image !== 'string' ||
    //   !/^data:image\/\w+;base64,/.test(image)
    // ) {
    //   return res.status(400).json({ message: 'Incorrect image format' })
    // }
    // const base64Image = image.split(';base64,').pop()

    // const imageBuffer = Buffer.from(base64Image, 'base64')

    const cuisineIdsArray = Array.isArray(cuisineIds) ? cuisineIds : []
    const cuisines = await Cuisine.find({ _id: { $in: cuisineIdsArray } })

    if (cuisines.length !== cuisineIdsArray.length) {
      return res.status(400).json({ error: 'One or more cuisines not found' })
    }

    const newRestaurant = new Restaurants({
      owner: savedUser._id,
      restaurantName,
      description,
      address,
      cuisines,
      openingHours,
      role,
      ratingsAndReviews,
      features,
      promotions,
      paymentMethods,
      dietaryOptions,
      awards,
    })

    const savedRestaurant = await newRestaurant.save()
    res.status(201).json({
      success: true,
      message: 'User and restaurant registered successfully',
      user: savedUser,
      restaurant: savedRestaurant,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const restaurantId = new ObjectId(`${req.params.id}`)
    const restaurant = await Restaurants.aggregate([
      { $match: { _id: restaurantId } },
      {
        $lookup: {
          from: 'Reservations',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'reservations',
        },
      },
      {
        $lookup: {
          from: 'Menu',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'menu',
        },
      },
      {
        $lookup: {
          from: 'PeriodTimes',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'availableTimes',
        },
      },
      {
        $lookup: {
          from: 'RatingAndReview',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          ratingsCount: { $size: '$reviews' },
          totalRating: {
            $cond: {
              if: { $eq: ['$ratingsCount', 0] },
              then: 0,
              else: { $sum: '$reviews.rating' },
            },
          },
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $eq: ['$ratingsCount', 0] },
              then: 0,
              else: { $divide: ['$totalRating', '$ratingsCount'] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'Cuisines',
          localField: 'cuisines',
          foreignField: '_id',
          as: 'cuisinesData',
        },
      },
      {
        $addFields: {
          cuisines: '$cuisinesData',
        },
      },
      {
        $project: {
          cuisinesData: 0,
        },
      },
    ])

    if (!restaurant || restaurant.length === 0) {
      return res.status(404).json({ message: 'restaurant not found' })
    }
    restaurant[0].averageRating = restaurant[0].averageRating.toFixed(1)
    res.json(restaurant[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/owner/:ownerId', async (req, res) => {
  try {
    const ownerId = req.params.ownerId

    if (!ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: 'Invalid owner ID' })
    }

    const restaurants = await Restaurants.find({ owner: ownerId })

    if (!restaurants || restaurants.length === 0) {
      return res
        .status(404)
        .json({ error: 'Restaurants not found for the owner' })
    }

    res.json(restaurants)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.patch('/:id', getRestaurant, async (req, res) => {
  try {
    const restaurantId = req.params.id
    const updateFields = req.body

    const updatedRestaurant = await Restaurants.findByIdAndUpdate(
      restaurantId,
      updateFields,
      { new: true, runValidators: true }
    )

    if (!updatedRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    res.status(200).json({
      message: 'Restaurant updated successfully',
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }

    console.error('Error updating restaurant:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurants.findByIdAndDelete(req.params.id)
    res.status(200).json({ deletedRestaurantId: restaurant._id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
