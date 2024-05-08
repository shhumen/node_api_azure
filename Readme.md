router.post('/', async (req, res) => {
try {
const { categoryId, title, description, image, body, status, tags } =
req.body

    // const user = await CommonUser.findOne(req.user)
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
    const user = await CommonUser.findById(decodedToken.userId)
    console.log(user.role[1])
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role[1] !== 'doctor') {
    }
    if (typeof image !== 'string' || !/^data:image\/\w+;base64,/.test(image)) {
      return res.status(400).json({ message: 'Incorrect image format' })
    }

    const base64Image = image.split(';base64,').pop()

    const imageBuffer = Buffer.from(base64Image, 'base64')
    const postingBlog = new Blog({
      categoryId,
      title,
      description,
      image: imageBuffer,
      body,
      authorId: user._id,
      status,
      tags,
    })

    await postingBlog.save()
    return res.status(201).json(postingBlog)

} catch (error) {
return res
.status(500)
.json({ message: 'Internal server error', error: error.message })
}
})
