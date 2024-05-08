const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OpeningHoursSchema = new Schema({
  day: {
    type: String,
    enum: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    // required: true,
  },
  openTime: {
    type: String,
    default: '09:00',
  },
  closeTime: {
    type: String,
    default: '22:00',
  },
})

const LocationSchema = Schema({
  city: {
    type: String,
    required: [true, 'missing branch city!'],
  },
  street: {
    type: String,
    required: [true, 'missing branch street!'],
  },
})

const RestaurantSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    restaurantName: {
      type: String,
      required: true,
    },
    description: String,
    address: {
      type: LocationSchema,
      required: [true, 'missing restaurant location information!'],
    },
    cuisines: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Cuisine',
      },
    ],
    openingHours: {
      type: [OpeningHoursSchema],
      default: [OpeningHoursSchema],
      // required: true,
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    capacity: Number,
    features: [String],
    history: String,
    chef: String,
    promotions: [String],
    paymentMethods: [String],
    dietaryOptions: [String],
    awards: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    acceptsYums: {
      type: Boolean,
      default: false,
    },
    image: { type: Buffer, default: null },
  },
  { versionKey: false, collection: 'Restaurants' }
)

const Restaurants = mongoose.model('Restaurants', RestaurantSchema)

module.exports = Restaurants
