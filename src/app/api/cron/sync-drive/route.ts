import { processDriveFolder } from '@/lib/sync/process-drive-folder';
import { connectToDatabase } from '@/lib/db/client';

export async function GET() {
  try {
    console.log('🚀 Iniciando sincronização...');
    await connectToDatabase();
    const result = await processDriveFolder();
    
    const message = result.processed === 0 
      ? 'Nenhum arquivo novo para processar'
      : `${result.processed} de ${result.total} arquivos processados com sucesso`;
    
    return Response.json({ 
      success: true, 
      message,
      processed: result.processed,
      total: result.total
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}