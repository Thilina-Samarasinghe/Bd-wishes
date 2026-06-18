import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Clear any expired tokens for cleanliness
    try {
      await db.verificationToken.deleteMany({
        where: { expires: { lt: new Date() } }
      });
    } catch {}

    // Generate login token
    const token = randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to DB
    await db.verificationToken.create({
      data: {
        token,
        email: email.toLowerCase(),
        expires,
      }
    });

    const origin = new URL(request.url).origin;
    const magicLink = `${origin}/api/auth/callback?token=${token}`;

    // Log the link to the console for the developer
    console.log('\n======================================');
    console.log(`🔑 PASSWORDLESS MAGIC LINK FOR: ${email}`);
    console.log(magicLink);
    console.log('======================================\n');

    // Send email using nodemailer if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || 'BD Wishes <no-reply@example.com>';

    let emailSent = false;
    let emailError = null;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort || '587'),
          secure: smtpPort === '465', // true for port 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: smtpFrom,
          to: email.toLowerCase(),
          subject: '🪄 Your Magic Sign-in Link - BD Wishes',
          text: `Hello,\n\nUse the link below to sign in to your BD Wishes account. This link is valid for 15 minutes:\n\n${magicLink}\n\nHappy customizing!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
              <h2 style="color: #d97706; text-align: center;">🎉 Welcome to BD Wishes!</h2>
              <p>Hello,</p>
              <p>Click the button below to log into your account and view/create birthday greeting cards. This magic link is valid for 15 minutes:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Log In to BD Wishes</a>
              </div>
              <p style="color: #666; font-size: 12px;">If you did not request this email, you can safely ignore it.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 10px; text-align: center;">Sent by BD Wishes Platform</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (err: any) {
        console.error('SMTP sending error:', err);
        emailError = err.message || 'SMTP sending failed';
      }
    }

    // In local development, we return the link directly to the response for a quick login loop!
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Magic link has been sent to your email address!' 
        : 'Magic link generated successfully! (SMTP not configured or failed)',
      // Expose link only in development mode
      link: isDev ? magicLink : null,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error('Magic link generation error:', error);
    return NextResponse.json({ error: 'Failed to process authentication.' }, { status: 500 });
  }
}
