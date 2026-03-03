import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      service: 'transcription-app',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        service: 'transcription-app',
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}
