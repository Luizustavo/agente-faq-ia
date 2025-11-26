import { getFAQEntries } from '@/lib/db/faq-entries';
import { connectToDatabase } from '@/lib/db/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const entries = await getFAQEntries();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedEntries = entries.map((entry: any) => ({
      _id: entry._id?.toString() || '',
      title: entry.title || 'Sem título',
      summary: entry.summary || 'Sem resumo disponível',
      meta: {
        discipline: entry.meta?.discipline || 'Não especificado',
        lectureNumber: entry.meta?.lectureNumber,
        theme: entry.meta?.theme
      },
      source: {
        fileName: entry.source?.fileName || null
      },
      createdAt: entry.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error('Error fetching FAQ entries:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch FAQ entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
