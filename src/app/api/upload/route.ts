import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
  try {
    // Dynamically set config inside the request to ensure Next.js environment variables are fully populated
    console.log('--- Cloudinary API Upload Config Debug ---');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // 1. Verify user session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { id: sessionToken }
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: 'Unauthorized. Session expired.' }, { status: 401 });
    }

    // 2. Parse multi-part form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // 3. Basic validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.' }, { status: 400 });
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload to Cloudinary using a Promise wrapper
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'bd-wishes-cards' },
        (error: unknown, uploadedResult: unknown) => {
          if (error) {
            reject(error);
          } else if (uploadedResult && typeof uploadedResult === 'object' && 'secure_url' in uploadedResult) {
            resolve(uploadedResult as { secure_url: string });
          } else {
            reject(new Error('Unknown upload error'));
          }
        }
      ).end(buffer);
    });

    // Return the secure URL of the uploaded image
    return NextResponse.json({
      success: true,
      url: result.secure_url
    });
  } catch (error) {
    console.error('File upload api error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image to Cloudinary.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
