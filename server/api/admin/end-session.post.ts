import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { gameSessions } from '../../database/schema';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

export default defineEventHandler(async (event) => {
  try {
    // Buscar sessão ativa
    const activeSession = await db.select()
      .from(gameSessions)
      .where(eq(gameSessions.status, 'active'))
      .limit(1)
      .then(rows => rows[0]);
    
    if (!activeSession) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nenhuma sessão ativa encontrada'
      });
    }
    
    // Finalizar a sessão
    const endTime = new Date().toISOString();
    
    await db.update(gameSessions)
      .set({
        status: 'finished',
        endTime
      })
      .where(eq(gameSessions.id, activeSession.id));
    
    return {
      success: true,
      message: 'Sessão finalizada com sucesso',
      sessionId: activeSession.id,
      endTime
    };
    
  } catch (error) {
    console.error('Erro ao finalizar sessão:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    });
  }
});