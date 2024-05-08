const express = require('express')
const mongoose = require('mongoose')
const authenticationToken = require('../middleware/authenticationToken')
const router = express.Router()
const Reservation = require('../models/reservation')

router.post('/', authenticationToken, async (req, res) => {
  const { date, timeSlot, guests, notes, userId, restaurantId } = req.body
  try {
    const newReservation = new Reservation({
      date,
      timeSlot,
      guests,
      userId,
      restaurantId,
      notes,
    })
    const savedReservation = await newReservation.save()
    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: savedReservation,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find()
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', authenticationToken, async (req, res) => {
  const reservationId = req.params.id
  const { date, timeSlot, guests, notes, status } = req.body
  try {
    const reservation = await Reservation.findById(reservationId)
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' })
    }

    reservation.date = date || reservation.date
    reservation.timeSlot = timeSlot || reservation.timeSlot
    reservation.guests = guests || reservation.guests
    reservation.notes = notes || reservation.notes
    reservation.status = status || reservation.status

    const updatedReservation = await reservation.save()
    res.json({
      message: 'Reservation updated successfully',
      reservation: updatedReservation,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/restaurant/:restaurantId', async (req, res) => {
  const restaurantId = req.params.restaurantId
  try {
    const reservations = await Reservation.find({ restaurantId })
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
