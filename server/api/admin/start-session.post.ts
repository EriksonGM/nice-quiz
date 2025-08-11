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
    // Buscar sessão em estado de espera
    const waitingSession = await db.select()
      .from(gameSessions)
      .where(eq(gameSessions.status, 'waiting'))
      .limit(1)
      .then(rows => rows[0]);
    
    if (!waitingSession) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nenhuma sessão aguardando para ser iniciada'
      });
    }
    
    // Verificar se já existe uma sessão ativa
    const activeSession = await db.select()
      .from(gameSessions)
      .where(eq(gameSessions.status, 'active'))
      .limit(1)
      .then(rows => rows[0]);
    
    if (activeSession) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Já existe uma sessão ativa'
      });
    }
    
    // Iniciar a sessão
    const startTime = new Date().toISOString();
    
    await db.update(gameSessions)
      .set({
        status: 'active',
        startTime
      })
      .where(eq(gameSessions.id, waitingSession.id));
    
    return {
      success: true,
      message: 'Sessão iniciada com sucesso',
      sessionId: waitingSession.id,
      startTime
    };
    
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    });
  }
});