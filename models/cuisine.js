const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CuisineSchema = new Schema(
  {
    cuisineName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, collection: 'Cuisines' }
)

const Cuisine = mongoose.model('Cuisines', CuisineSchema)
module.exports = Cuisine
