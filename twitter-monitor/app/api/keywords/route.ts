import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all keywords
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isNegative = searchParams.get('isNegative');

    const where: any = {};
    if (category) where.category = category;
    if (isNegative !== null) where.isNegative = isNegative === 'true';

    const keywords = await prisma.keyword.findMany({
      where,
      include: {
        _count: {
          select: { profileKeywords: true, tweetTags: true },
        },
      },
      orderBy: { word: 'asc' },
    });

    return NextResponse.json(keywords);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new keyword
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, category, isNegative } = body;

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const keyword = await prisma.keyword.create({
      data: {
        word: word.toLowerCase().trim(),
        category,
        isNegative: isNegative || false,
      },
    });

    return NextResponse.json(keyword, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
