const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {getImages, addImage} = require('./database.js');
const {uploadImage} = require('./s3.js');
const crypto = require('crypto');

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function generateImageName() {
    return crypto.randomBytes(32).toString('hex');
}

app.use(express.static("dist"));

// get all image data from database
app.get("/api/images", async (req, res) => {
    const images = await getImages();
    res.send({images});
});

// get image file by id
app.get("/api/images/:imageName", (req, res) => {
    const imageName = req.params.imageName;
    const readStream = fs.createReadStream(`images/${imageName}`);
    readStream.pipe(res);
});

// add image to database
app.post("/api/images", upload.single('image'), async (req, res) => {    
    // get data from post request
    const description = req.body.description;
    const mimeType = req.file.mimetype;
    const imageBuffer = req.file.buffer;

    // generate unique image name
    const imageName = generateImageName();
    
    // store image in s3 bucket
    const s3Result = await uploadImage(imageName, imageBuffer, mimeType);
    
    // add image to database
    const databaseResult = await addImage(imageName, description);
    console.log(databaseResult);

    // send response
    res.status(201).send({databaseResult});
});

app.get('*', (req, res) => {
    res.sendFile('dist/index.html')
});

const port = process.env.PORT || 8080;

app.listen(port, () => {console.log(`Listening on port ${port}...`)});

