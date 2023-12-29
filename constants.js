require('dotenv').config()
const PORT = process.env.PORT
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

module.exports = {PORT,CLIENT_ID,CLIENT_SECRET,REDIRECT_URI}