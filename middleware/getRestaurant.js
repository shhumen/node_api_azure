const Restaurant = require('../models/restaurants')
const Product = require('../models/restaurants')

async function getRestaurant(req, res, next) {
  let restaurant
  try {
    restaurant = await Restaurant.findById(req.params.id)
    if (restaurant == null) {
      return res.status(404).json({ message: 'Restaurant not found' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.restaurant = restaurant
  next()
}

module.exports = getRestaurant
