const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local video file to Cloudinary
 * Returns { publicId, secureUrl }
 */
async function uploadVideo(localFilePath, userId, jobId) {
  console.log(`☁️  Uploading to Cloudinary: ${localFilePath}`);

  const result = await cloudinary.uploader.upload(localFilePath, {
    resource_type: 'video',
    folder:        `dots/${userId}`,
    public_id:     `viz_${jobId}`,
    overwrite:     true,
    chunk_size:    6000000,  // 6MB chunks for large files
    timeout:       120000,
  });

  console.log(`✅ Cloudinary upload done: ${result.secure_url}`);

  // Delete local file after successful upload
  try {
    fs.unlinkSync(localFilePath);
    console.log(`🗑️  Local file deleted: ${localFilePath}`);
  } catch (e) {
    console.warn('Could not delete local file:', e.message);
  }

  return {
    publicId:  result.public_id,
    secureUrl: result.secure_url,
  };
}

/**
 * Delete a video from Cloudinary by its public_id
 */
async function deleteVideo(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    console.log(`🗑️  Cloudinary video deleted: ${publicId}`);
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
  }
}

module.exports = { uploadVideo, deleteVideo };