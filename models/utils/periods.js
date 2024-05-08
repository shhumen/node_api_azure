const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PeriodTimesSchema = new Schema(
  {
    restaurantId: {
      type: mongoose.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    periodIds: {
      type: [mongoose.Types.ObjectId],
      ref: 'PeriodEnums',
      required: true,
    },
  },
  { versionKey: false, collection: 'PeriodTimes' }
)

const PeriodTimes = mongoose.model('PeriodTimes', PeriodTimesSchema)

module.exports = PeriodTimes
