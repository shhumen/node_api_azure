const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'restaurant'],
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    profilePic: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    firstname: String,
    lastname: String,
    phone: String,
    // address: {
    //   street: String,
    //   city: String,
    //   state: String,
    //   zip: String,
    // },
    favoriteRestaurants: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Restaurants',
      },
    ],
    preferences: {
      dietary: [String],
      cuisine: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'Cuisine',
        },
      ],
      features: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'Users', versionKey: false }
)

const User = mongoose.model('Users', UserSchema)
module.exports = User
