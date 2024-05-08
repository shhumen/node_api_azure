const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RatingAndReviewSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: mongoose.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    reviewText: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false, collection: 'RatingAndReview' }
)

const RatingAndReview = mongoose.model('RatingAndReview', RatingAndReviewSchema)

module.exports = RatingAndReview
