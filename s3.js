const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { dotenv } = require('dotenv');

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;


const s3 = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});

async function uploadImage(imageName, imageBuffer, mimeType) {
    const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: imageBuffer,
        ContentType: mimeType,
    };

    try {
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        return data;
    } catch (err) {
        console.log("Error", err);
    }
}

async function deleteImage(imageName) {
    const params = {
        Bucket: bucketName,
        Key: imageName
    };

    try {
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        console.log(`imageName=${imageName} deleted successfully`);
    } catch (err) {
        console.log("Error", err);
    }
}

module.exports = {uploadImage, deleteImage};