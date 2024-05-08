const express = require('express')
const { default: mongoose } = require('mongoose')
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')

require('dotenv').config()
const app = express()

app.use(express.json())
app.use(cors())

mongoose
  .connect(process.env.DATABASE_SERVER_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the database!')
  })
  .catch((err) => {
    console.log('Connection failed!', err)
  })

const restaurantRouter = require('./routes/restaurants')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/users')
const otpRouter = require('./routes/otp')
const cuisinesRouter = require('./routes/cuisines')
const menusRouter = require('./routes/menu')
const reviewAndRatingRouter = require('./routes/ratingReviews')
const periodEnumRouter = require('./routes/periodEnums')
const periodTimesRouter = require('./routes/periods')
const reservationRouter = require('./routes/reservations')
const imagesRouter = require('./routes/images')
const favoritesRouter = require('./routes/favorites')

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/otp', otpRouter)
app.use('/api/restaurants', restaurantRouter)
app.use('/api/cuisines', cuisinesRouter)
app.use('/api/menus', menusRouter)
app.use('/api/reviews', reviewAndRatingRouter)
app.use('/api/periodTimes', periodTimesRouter)
app.use('/api/periodEnum', periodEnumRouter)
app.use('/api/reservation', reservationRouter)
app.use('/api/images', imagesRouter)
app.use('/api/favorites', favoritesRouter)

const PORT = process.env.PORT || 5004
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
