const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {getImages, addImage} = require('./database.js');

const app = express();

const upload = multer({ dest: 'images/' });

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
    const imageName = req.file.filename;
    const description = req.body.description;
    const image = await addImage(imageName, description);
    console.log(image);
    res.send({image});
});

app.get('*', (req, res) => {
    res.sendFile('dist/index.html')
});

const port = process.env.PORT || 8080;

app.listen(port, () => {console.log(`Listening on port ${port}...`)});

