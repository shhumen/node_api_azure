const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const PeriodTimes = require('../models/utils/periods')
const PeriodEnums = require('../models/utils/periodEnum')
const ObjectId = mongoose.Types.ObjectId

router.post('/', async (req, res) => {
  try {
    const periodTimes = await PeriodTimes.findOneAndUpdate(
      { periodIds: req.body.periodIds, restaurantId: req.body.restaurantId },
      req.body,
      { upsert: true, new: true }
    )
    res.status(201).json(periodTimes)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const periodTimesWithDetails = await PeriodTimes.aggregate([
      {
        $lookup: {
          from: 'PeriodEnums',
          localField: 'periodIds',
          foreignField: '_id',
          as: 'periods',
        },
      },
      {
        $addFields: {
          periodTimes: {
            $map: {
              input: '$periods',
              as: 'period',
              in: {
                periodName: '$$period.periodName',
                timeSlots: {
                  $reduce: {
                    input: {
                      $range: [
                        {
                          $multiply: [
                            {
                              $toInt: { $substr: ['$$period.startTime', 0, 2] },
                            },
                            60,
                          ],
                        },
                        {
                          $multiply: [
                            { $toInt: { $substr: ['$$period.endTime', 0, 2] } },
                            60,
                          ],
                        },
                        30,
                      ],
                    },
                    initialValue: [],
                    in: {
                      $concatArrays: [
                        '$$value',
                        [
                          {
                            $dateToString: {
                              format: '%H:%M',
                              date: {
                                $add: [
                                  new Date(0),
                                  { $multiply: ['$$this', 60000] },
                                ],
                              },
                            },
                          },
                        ],
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          restaurantId: 1,
          periodIds: 1,
          periodTimes: 1,
        },
      },
    ])

    res.json(periodTimesWithDetails)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const restaurantId = req.params.id

    const periodsWithDetails = await PeriodTimes.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      {
        $lookup: {
          from: 'PeriodEnums',
          localField: 'periodIds',
          foreignField: '_id',
          as: 'periods',
        },
      },
      {
        $project: {
          _id: 1,
          restaurantId: 1,
          periods: {
            $map: {
              input: '$periods',
              as: 'period',
              in: {
                periodName: '$$period.periodName',
                timeSlots: {
                  $reduce: {
                    input: {
                      $range: [
                        {
                          $multiply: [
                            {
                              $toInt: { $substr: ['$$period.startTime', 0, 2] },
                            },
                            60,
                          ],
                        },
                        {
                          $multiply: [
                            { $toInt: { $substr: ['$$period.endTime', 0, 2] } },
                            60,
                          ],
                        },
                        30,
                      ],
                    },
                    initialValue: [],
                    in: {
                      $concatArrays: [
                        '$$value',
                        [
                          {
                            $dateToString: {
                              format: '%H:%M',
                              date: {
                                $add: [
                                  new Date(0),
                                  { $multiply: ['$$this', 60000] },
                                ],
                              },
                            },
                          },
                        ],
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    ])

    res.json(periodsWithDetails)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
