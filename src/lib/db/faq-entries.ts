import { connectToDatabase } from './client';

interface FAQEntryInput {
  title: string;
  summary: string;
  source: {
    driveFileId: string;
    fileName: string;
    mimeType: string;
  };
  meta: {
    discipline: string;
    lectureNumber?: number;
    theme?: string;
  };
}

export async function createFAQEntry(entry: FAQEntryInput) {
  const { db } = await connectToDatabase();
  await db.collection('faqEntries').insertOne({
    ...entry,
    createdAt: new Date(),
  });
}

export async function getFAQEntries() {
  const { db } = await connectToDatabase();
  const entries = await db.collection('faqEntries').find().sort({ createdAt: -1 }).toArray();
  return entries;
}

export async function isFileProcessed(driveFileId: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  const existing = await db.collection('faqEntries').findOne({
    'source.driveFileId': driveFileId,
  });
  return !!existing;
}