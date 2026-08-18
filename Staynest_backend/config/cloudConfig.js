import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// 1. Configure Cloudinary with your .env variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// 2. Set up Multer Storage to send files straight to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'staynest_react_uploads', // Folder created automatically in Cloudinary
    allowed_formats: ['png', 'jpg', 'jpeg'],
  },
});

// 3. Export using ES Module syntax
export { cloudinary, storage };