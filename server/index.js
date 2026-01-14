const express = require('express')
const cors = require('cors')
const multer = require ('multer')
const upload = multer ( { storage : multer.memoryStorage() })


const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend' })
})

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image received" })
  }

  console.log("Received File:", req.file.originalname)
  console.log("Size:", req.file.size, "bytes")

  return res.json({
    message: "Image Uploaded Successfully",
    filename: req.file.originalname,
    size: req.file.size
  })
})



app.listen(5000, () => console.log('Server running on port 5000'))
