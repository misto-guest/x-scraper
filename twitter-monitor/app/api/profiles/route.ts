import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Validation error helper
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// GET all profiles
export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        _count: {
          select: { tweets: true },
        },
        keywords: {
          include: { keyword: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(profiles);
  } catch (error: any) {
    console.error('[GET /api/profiles] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles', details: error.message },
      { status: 500 }
    );
  }
}

// POST create new profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, displayName, avatar } = body;

    // Validate username
    if (!username || typeof username !== 'string') {
      throw new ValidationError('Username is required and must be a string');
    }

    // Clean username
    const cleanUsername = username.replace('@', '').trim();

    // Validate username format (Twitter usernames are 1-15 characters, alphanumeric + underscore)
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
      throw new ValidationError(
        'Invalid Twitter username format. Must be 1-15 characters (letters, numbers, underscore only)'
      );
    }

    // Check if profile already exists
    const existing = await prisma.profile.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Profile already exists', profile: existing },
        { status: 409 }
      );
    }

    const profile = await prisma.profile.create({
      data: {
        username: cleanUsername,
        displayName: displayName?.trim() || cleanUsername,
        avatar,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/profiles] Error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Profile with this username already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create profile', details: error.message },
      { status: 500 }
    );
  }
}
