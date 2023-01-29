const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {getImages, addImage, getImage, deleteImage} = require('./database.js');
const {uploadImage, deleteImageFromS3} = require('./s3.js');
const crypto = require('crypto');
const {fetchSignedUrl} = require('./s3.js');
const sharp = require('sharp');

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
    
    // Add signed url to each image
    for (const image of images) {
        image.imageURL = await fetchSignedUrl(image.file_name);
    }
    res.send({images});
});

// this is outsourced to s3 now
// // get image file by id
// app.get("/api/images/:imageName", (req, res) => {
//     const imageName = req.params.imageName;
//     const readStream = fs.createReadStream(`images/${imageName}`);
//     readStream.pipe(res);
// });

// add image to database
app.post("/api/images", upload.single('image'), async (req, res) => {    
    // get data from post request
    const description = req.body.description;
    const mimeType = req.file.mimetype;
    const imageBuffer = req.file.buffer;

    // generate unique image name
    const imageName = generateImageName();
    
    // resize image
    const resizedImageBuffer = await sharp(imageBuffer)
        .resize({ width: 200, height: 200, fit: 'inside' })
        .toBuffer();

    // store image in s3 bucket
    const s3Result = await uploadImage(imageName, resizedImageBuffer, mimeType);
    
    // add image to database
    const databaseResult = await addImage(imageName, description);
    databaseResult.imageURL = await fetchSignedUrl(databaseResult.file_name);
    
    // send response
    res.status(201).send({image: databaseResult});
});

app.delete("/api/images/:id", async (req, res) => {
    const id = req.params.id;
    try 
    {
        const image = await getImage(id);
        if (!image) {
            res.status(404).send({message: "Image not found"});
            return;
        }
        await deleteImage(id);
        await deleteImageFromS3(image.file_name);
        res.status(200).send({image});
    }
    catch(error)
    {
        res.status(500).send({message: "Internal server error"});
    }
});

app.get('*', (req, res) => {
    res.sendFile('dist/index.html')
});

const port = process.env.PORT || 8080;

app.listen(port, () => {console.log(`Listening on port ${port}...`)});

