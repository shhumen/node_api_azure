const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImagesSchema = new Schema(
  {
    restaurantId: {
      type: mongoose.Types.ObjectId,
      ref: 'Restaurants',
      required: true,
    },
    imageUrl: {
      type: String,
    },
    imagePath: {
      type: String,
    },
  },
  { versionKey: false, collection: 'Images' }
)

const Images = mongoose.model('Images', ImagesSchema)

module.exports = Images

// isterse url yuklesin , isterse yuklesin
