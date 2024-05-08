const express = require('express')
const router = express.Router()
const authenticationToken = require('../middleware/authenticationToken')
const Menu = require('../models/menu')

router.get('/', authenticationToken, async (req, res) => {
  try {
    const menus = await Menu.find()
    res.json(menus)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

router.get('/:id', authenticationToken, async (req, res) => {
  try {
    const menus = await Menu.findOne({ restaurantId: req.params.id })
    res.json(menus)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

router.post('/', authenticationToken, async (req, res) => {
  const { restaurantId, menuDescription, menuImage } = req.body

  try {
    const existingMenu = await Menu.findOne({ restaurantId })
    //if there is already menu do not post new one --> deyishiklik putda ede biler
    if (existingMenu) {
      return res
        .status(400)
        .json({ message: 'A menu already exists for this restaurant' })
    }

    const newMenu = new Menu({
      restaurantId,
      menuDescription,
      menuImage,
    })
    const savedMenu = await newMenu.save()
    return res.status(201).json(savedMenu)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/:id', authenticationToken, async (req, res) => {
  const { menuDescription, menuImages } = req.body
  const { id } = req.params

  try {
    const existingMenu = await Menu.findOne({ restaurantId: id })
    if (!existingMenu) {
      return res
        .status(404)
        .json({ message: 'Menu not found for this restaurant' })
    }

    existingMenu.menuDescription = menuDescription
    existingMenu.menuImages = menuImages

    const updatedMenu = await existingMenu.save()
    res.json(updatedMenu)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

//deleting by restaurant id
router.delete('/:id', authenticationToken, async (req, res) => {
  const { id } = req.params

  try {
    const menu = await Menu.findOneAndDelete({ restaurantId: id })
    if (!menu) {
      return res
        .status(404)
        .json({ message: 'Menu not found for this restaurant' })
    }
    res.status(200).json({
      deletedMenuId: menu._id,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
