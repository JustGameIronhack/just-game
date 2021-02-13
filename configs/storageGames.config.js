const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'JustGame/Games',
        format: 'png',
        eager: [{ width: 200, height: 300, crop: 'scale'}]
    }
});

module.exports = multer({storage});