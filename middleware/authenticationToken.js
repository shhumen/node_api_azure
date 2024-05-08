const jwt = require('jsonwebtoken')

function authenticationToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).send('Access Denied')

  jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
    if (err) return res.status(403).send('Invalid Token')
    const expiresInMilliseconds = decodedToken.iat * 1000
    const tokenExpirationDate = new Date(expiresInMilliseconds)

    console.log(decodedToken)
    req.user = {
      ...decodedToken,
      token: token,
      expirationDate: tokenExpirationDate,
    }
    next()
  })
}

module.exports = authenticationToken
