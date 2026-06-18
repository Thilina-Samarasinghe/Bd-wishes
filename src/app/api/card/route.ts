import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';



// GET: Fetch user's past cards OR load a single card by ID (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('id');

    // If ID is provided, fetch card details publicly (for card recipients)
    if (cardId) {
      const card = await db.birthdayWish.findUnique({
        where: { id: cardId }
      });
      if (!card) {
        return NextResponse.json({ error: 'Birthday card not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, card });
    }

    // Otherwise, require authentication to fetch current user's creation history
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { id: sessionToken }
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve cards owned by this user
    const cards = await db.birthdayWish.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, cards });
  } catch (error) {
    console.error('Fetch card data error:', error);
    return NextResponse.json({ error: 'Failed to retrieve card data.' }, { status: 500 });
  }
}

// POST: Save a new card customization
export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const { name, age, wishes, theme, music, effects, images } = body;

    if (!name || !wishes) {
      return NextResponse.json({ error: 'Recipient name and wishes are required.' }, { status: 400 });
    }

    // Ensure image count doesn't exceed 5
    const imagesList = Array.isArray(images) ? images : [];
    if (imagesList.length > 5) {
      return NextResponse.json({ error: 'You can upload a maximum of 5 images.' }, { status: 400 });
    }

    const parsedAge = age ? parseInt(age) : null;

    // Create birthday wish
    const card = await db.birthdayWish.create({
      data: {
        userId: session.userId,
        name,
        age: parsedAge,
        wishes,
        theme,
        music,
        effects: Array.isArray(effects) ? effects : [],
        images: imagesList
      }
    });

    const origin = new URL(request.url).origin;
    const shareLink = `${origin}/wish?id=${card.id}`;

    return NextResponse.json({
      success: true,
      cardId: card.id,
      shareLink,
      message: 'Birthday card saved successfully!'
    });
  } catch (error) {
    console.error('Save card error:', error);
    return NextResponse.json({ error: 'Failed to save birthday card.' }, { status: 500 });
  }
}

// DELETE: Delete a past card and its associated Cloudinary images
export async function DELETE(request: Request) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('id');

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required.' }, { status: 400 });
    }

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

    // 1. Fetch the card to check ownership and get image URLs
    const card = await db.birthdayWish.findUnique({
      where: { id: cardId }
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found.' }, { status: 404 });
    }

    if (card.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden. You do not own this card.' }, { status: 403 });
    }

    // 2. Delete images from Cloudinary if they exist
    const imageLinks = card.images || [];
    for (const imgUrl of imageLinks) {
      const publicId = extractPublicId(imgUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error(`Failed to delete Cloudinary image: ${publicId}`, cloudinaryError);
        }
      }
    }

    // 3. Delete card from DB
    await db.birthdayWish.delete({
      where: { id: cardId }
    });

    return NextResponse.json({
      success: true,
      message: 'Card and associated images deleted successfully.'
    });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json({ error: 'Failed to delete birthday card.' }, { status: 500 });
  }
}

// Helper to extract Cloudinary public ID from URL
function extractPublicId(url: string): string | null {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    const remaining = parts[1].replace(/^v\d+\//, ''); // remove version number prefix like v16284617
    const lastDotIdx = remaining.lastIndexOf('.');
    if (lastDotIdx === -1) return remaining;
    return remaining.substring(0, lastDotIdx); // remove format extension like .jpg
  } catch (e) {
    return null;
  }
}

