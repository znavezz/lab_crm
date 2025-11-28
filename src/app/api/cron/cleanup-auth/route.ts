import { NextRequest, NextResponse } from 'next/server';
import { cleanupAuthData } from '@/lib/jobs/cleanup-auth';

/**
 * GET /api/cron/cleanup-auth
 * 
 * Cron job endpoint for cleaning up expired authentication data.
 * 
 * This should be called periodically (e.g., every hour) via:
 * - Vercel Cron (vercel.json)
 * - External cron service (cron-job.org)
 * - Docker cron
 * - System cron
 * 
 * Security: Add Authorization header check in production
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run the cleanup job
    const result = await cleanupAuthData();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('Error in cleanup cron job:', error);
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for services that prefer POST
export const POST = GET;

