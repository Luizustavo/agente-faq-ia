import { processDriveFolder } from '@/lib/sync/process-drive-folder';
import { connectToDatabase } from '@/lib/db/client';

export async function GET() {
  try {
    await connectToDatabase();
    await processDriveFolder();
    return Response.json({ success: true, message: 'Sincronização concluída com sucesso!' });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}