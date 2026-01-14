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

app.post ( '/upload' , upload.single('image')  , (req,res) => {
    //If no file uploaded
    if (!file.req) {
        return res.status(400).json({error : "No image recieved"})
    }

    console.log (`Received File : ${res.file.orginalName} `)
    console.log (`Size : ${res.file.size} bytes` )

    res.json ({
        message : "Image Uploaded Successfuly",
        filename : req.file.originalName ,
        size : req.file.size
    })
})


app.listen(5000, () => console.log('Server running on port 5000'))
