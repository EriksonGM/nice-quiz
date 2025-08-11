import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { players, gameSessions } from '../database/schema';
import { eq, desc } from 'drizzle-orm';
import type { DashboardData } from '~/types/quiz';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

export default defineEventHandler(async (event) => {
  try {
    // Buscar sessão mais recente
    const session = await db.select()
      .from(gameSessions)
      .orderBy(desc(gameSessions.createdAt))
      .limit(1)
      .then(rows => rows[0]);
    
    if (!session) {
      // Criar uma nova sessão se não existir nenhuma
      const [newSession] = await db.insert(gameSessions)
        .values({
          status: 'waiting',
          duration: 600
        })
        .returning();
      
      return {
        session: newSession,
        players: [],
        timeRemaining: 600
      };
    }
    
    // Buscar jogadores da sessão
    const sessionPlayers = await db.select()
      .from(players)
      .where(eq(players.sessionId, session.id))
      .orderBy(desc(players.totalScore));
    
    // Calcular tempo restante se a sessão estiver ativa
    let timeRemaining = undefined;
    
    if (session.status === 'active' && session.startTime) {
      const startTime = new Date(session.startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      timeRemaining = Math.max(0, session.duration - elapsed);
      
      // Verificar se a sessão expirou
      if (timeRemaining <= 0 && session.status === 'active') {
        await db.update(gameSessions)
          .set({
            status: 'finished',
            endTime: new Date().toISOString()
          })
          .where(eq(gameSessions.id, session.id));
        
        session.status = 'finished';
        session.endTime = new Date().toISOString();
        timeRemaining = 0;
      }
    }
    
    const response: DashboardData = {
      session,
      players: sessionPlayers,
      timeRemaining
    };
    
    return response;
    
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    });
  }
});