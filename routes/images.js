const express = require('express')
const router = express.Router()
const authenticationToken = require('../middleware/authenticationToken')
const Images = require('../models/images')
const upload = require('../services/upload')

router.post(
  '/',
  authenticationToken,
  upload.single('image'),
  async (req, res) => {
    const { restaurantId, imageUrl, imagePath } = req.body

    try {
      const image = new Images({
        restaurantId,
        imageUrl,
        imagePath: req.file.path,
        // Use req.file.path to get the path of the uploaded file
      })

      await image.save()

      res.status(201).json({ message: 'Image uploaded successfully' })
    } catch (error) {
      console.error('Error uploading image:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

module.exports = router
