const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')
const Table = require('./table')

//reservasiya ==> seher , gunorta , axsham olaraq bolunmelidi

const ReservationSchema = new Schema(
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
    date: {
      type: Date,
      required: true,
    },
    // event Type
    timeSlot: {
      type: String,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tableId: {
      type: mongoose.Types.ObjectId,
      ref: 'Table',
    },
    notes: String,
  },
  { versionKey: false, collection: 'Reservations' }
)

const Reservation = mongoose.model('Reservations', ReservationSchema)

module.exports = Reservation
