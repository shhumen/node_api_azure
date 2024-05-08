const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MenuItemSchema = new Schema(
  {
    restaurantId: {
      type: mongoose.Types.ObjectId,
      ref: 'Restaurants',
      required: true,
    },
    menuDescription: [
      {
        dishName: {
          type: String,
          required: true,
        },
        dishPrice: {
          type: String,
          required: true,
        },
        dishDescription: {
          type: String,
        },
      },
    ],
    menuImages: {
      type: [String],
    },
  },
  { versionKey: false, collection: 'Menu' }
)

const MenuItem = mongoose.model('Menu', MenuItemSchema)

module.exports = MenuItem
