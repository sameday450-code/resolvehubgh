const cloudinary = require('../../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, folder = 'complaints') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `qr-complaint-saas/${folder}`,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm', 'pdf'],
        max_file_size: 10485760,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const uploadFiles = async (files, folder) => {
  const results = [];
  for (const file of files) {
    const result = await uploadToCloudinary(file.buffer, folder);
    results.push({
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  }
  return results;
};

module.exports = { uploadFiles, uploadToCloudinary };
