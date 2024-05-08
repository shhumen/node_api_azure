const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PeriodEnumShcema = new Schema(
  {
    periodName: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      default: '00:00',
    },
    endTime: {
      type: String,
      required: true,
      default: '00:00',
    },
  },
  { versionKey: false, collection: 'PeriodEnums' }
)

const PeriodEnum = mongoose.model('PeriodEnums', PeriodEnumShcema)

module.exports = PeriodEnum
