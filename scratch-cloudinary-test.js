const { v2: cloudinary } = require('cloudinary');

// Hardcoding the exact credentials to isolate any .env loading/parsing issues
cloudinary.config({
  cloud_name: 'thilina',
  api_key: '629248331299386',
  api_secret: 'p_zTcm60aRQ78A2EJE7ZzzG5o0Y',
});

const dummyPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function testHardcodedUpload() {
  console.log('--- Cloudinary Hardcoded Upload Test ---');
  return new Promise((resolve) => {
    cloudinary.uploader.upload_stream(
      { folder: 'bd-wishes-cards' },
      (error, result) => {
        if (error) {
          console.error(`❌ Upload failed:`, error.message || error);
          if (error.http_code) console.error('HTTP Status:', error.http_code);
          resolve(false);
        } else {
          console.log(`✅ Upload SUCCESS! URL:`, result.secure_url);
          resolve(true);
        }
      }
    ).end(dummyPngBuffer);
  });
}

testHardcodedUpload();
