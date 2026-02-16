import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, displayName, avatar } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const profile = await prisma.profile.create({
      data: {
        username: username.replace('@', ''),
        displayName,
        avatar,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
