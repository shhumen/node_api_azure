const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FavoritesSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listName: {
      type: String,
      required: true,
    },
    restaurants: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Restaurant',
      },
    ],
  },
  { timestamps: true, versionKey: false, collection: 'Favorites' }
)

const Favorites = mongoose.model('Favorites', FavoritesSchema)

module.exports = Favorites
