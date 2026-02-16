import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET tweets with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const profileId = searchParams.get('profileId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (status) where.status = status;
    if (profileId) where.profileId = profileId;

    const tweets = await prisma.tweet.findMany({
      where,
      include: {
        profile: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.tweet.count({ where });

    return NextResponse.json({
      tweets,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update tweet status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tweetId, status, reviewedBy } = body;

    if (!tweetId || !status) {
      return NextResponse.json(
        { error: 'tweetId and status are required' },
        { status: 400 }
      );
    }

    const tweet = await prisma.tweet.update({
      where: { tweetId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || 'admin',
      },
    });

    return NextResponse.json(tweet);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
