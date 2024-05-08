const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const uploadFolder = path.join(__dirname, '../uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder)
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/
  const extetion = path.extname(file.originalname).toLowerCase()
  if (allowedTypes.test(extetion) && allowedTypes.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type'), false)
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
  fileFilter: fileFilter,
})
module.exports = upload
