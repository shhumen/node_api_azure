const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TableSchema = new Schema(
  {
    restaurantId: {
      type: mongoose.Types.ObjectId,
      ref: 'Restaurants',
      required: true,
    },
    tableName: {
      type: String,
    },
    capacity: {
      type: Number,
      required: true,
      max: 6,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false, collection: 'Tables' }
)

const Table = mongoose.model('Tables', TableSchema)

module.exports = Table
