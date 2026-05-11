import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('[v0] Testing database connection...')

    // Count records from each table
    const userCount = await prisma.user.count()
    const bookCount = await prisma.book.count()
    const transactionCount = await prisma.transaction.count()

    console.log('[v0] Database counts - Users:', userCount, 'Books:', bookCount, 'Transactions:', transactionCount)

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        data: {
          userCount,
          bookCount,
          transactionCount,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Database test error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
