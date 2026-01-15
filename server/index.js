require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require ('multer')
const upload = multer ( { storage : multer.memoryStorage() })
const analyzeFoodImage = require("./groq")


const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend' })
})

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image received" })
  }

  console.log("Received File:", req.file.originalname)
  console.log("Size:", req.file.size, "bytes")

  // Sending image to Gemini
  const analysis = await analyzeFoodImage (req.file.buffer)

  return res.json({
    message: "Analyzed",
    filename: req.file.originalname,
    size: req.file.size,
    analysis
  })
})



app.listen(5000, () => console.log('Server running on port 5000'))
