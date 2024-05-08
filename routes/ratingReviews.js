const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const ReviewAndRating = require('../models/ratingReviews')
const authenticationToken = require('../middleware/authenticationToken')

router.get('/', async (req, res) => {
  try {
    const reviews = await ReviewAndRating.find()
    res.json(reviews)
  } catch (error) {}
})

router.post('/', authenticationToken, async (req, res) => {
  try {
    const { userId, restaurantId, rating, reviewText } = req.body

    const existingReview = await ReviewAndRating.findOne({
      userId,
      restaurantId,
    })
    if (existingReview) {
      return res.status(400).json({
        error: 'You have already submitted a review for this restaurant',
      })
    }

    const newReviewAndRating = new ReviewAndRating({
      userId,
      restaurantId,
      rating,
      reviewText,
    })
    await newReviewAndRating.save()
    res.status(201).json({
      status: 'success',
      message: 'Review created successfully',
      newReviewAndRating,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const reviews = await ReviewAndRating.find({
      restaurantId: id,
    })
    res.json(reviews)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const reviews = await ReviewAndRating.find({ userId })
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this user' })
    }
    res.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews by user ID:', error)
    res.status(500).json({
      message: 'Internal server error',
    })
  }
})

router.put('/:userId', authenticationToken, async (req, res) => {
  try {
    const { userId } = req.params
    const { restaurantId, rating, reviewText } = req.body

    const existingReview = await ReviewAndRating.findOne({
      userId,
      restaurantId,
    })
    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' })
    }

    existingReview.rating = rating
    existingReview.reviewText = reviewText

    await existingReview.save()

    res.status(200).json({
      status: 'success',
      message: 'Review updated successfully',
      updatedReview: existingReview,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', authenticationToken, async (req, res) => {
  const { id } = req.params

  try {
    const review = await ReviewAndRating.findOneAndDelete({ _id: id })
    if (!review) {
      return res
        .status(404)
        .json({ message: 'Review78 not found for this restaurant' })
    }
    res.status(200).json({
      deletedReviewId: review._id,
      message: 'Review deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
