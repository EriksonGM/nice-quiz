import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { players, gameSessions } from '../../database/schema';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

export default defineEventHandler(async (event) => {
  try {
    // Buscar sessão atual (ativa ou aguardando)
    let session = await db.select()
      .from(gameSessions)
      .where(eq(gameSessions.status, 'active'))
      .limit(1)
      .then(rows => rows[0]);
    
    if (!session) {
      session = await db.select()
        .from(gameSessions)
        .where(eq(gameSessions.status, 'waiting'))
        .limit(1)
        .then(rows => rows[0]);
    }
    
    if (!session) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nenhuma sessão encontrada'
      });
    }
    
    // Buscar jogadores da sessão
    const sessionPlayers = await db.select()
      .from(players)
      .where(eq(players.sessionId, session.id))
      .orderBy(players.totalScore);
    
    // Verificar se a sessão ativa expirou
    if (session.status === 'active' && session.startTime) {
      const startTime = new Date(session.startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      
      if (elapsed >= session.duration) {
        // Finalizar sessão automaticamente
        await db.update(gameSessions)
          .set({
            status: 'finished',
            endTime: new Date().toISOString()
          })
          .where(eq(gameSessions.id, session.id));
        
        session.status = 'finished';
        session.endTime = new Date().toISOString();
      }
    }
    
    return {
      session,
      players: sessionPlayers
    };
    
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    });
  }
});