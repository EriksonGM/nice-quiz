import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { players, gameSessions } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import type { JoinGameRequest, JoinGameResponse } from '~/types/quiz';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<JoinGameRequest>(event);
    
    if (!body.playerName || body.playerName.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nome do jogador é obrigatório'
      });
    }
    
    // Buscar ou criar sessão ativa/aguardando
    let session = await db.select()
      .from(gameSessions)
      .where(eq(gameSessions.status, 'waiting'))
      .limit(1)
      .then(rows => rows[0]);
    
    if (!session) {
      // Criar nova sessão
      const [newSession] = await db.insert(gameSessions)
        .values({
          status: 'waiting',
          duration: 600 // 10 minutos
        })
        .returning();
      
      session = newSession;
    }
    
    // Verificar se o jogador já existe nesta sessão
    const existingPlayer = await db.select()
      .from(players)
      .where(and(
        eq(players.name, body.playerName.trim()),
        eq(players.sessionId, session.id)
      ))
      .limit(1)
      .then(rows => rows[0]);
    
    if (existingPlayer) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Já existe um jogador com este nome nesta sessão'
      });
    }
    
    // Criar novo jogador
    const [newPlayer] = await db.insert(players)
      .values({
        name: body.playerName.trim(),
        sessionId: session.id,
        totalScore: 0,
        questionsAnswered: 0,
        correctAnswers: 0
      })
      .returning();
    
    const response: JoinGameResponse = {
      player: newPlayer,
      session: session
    };
    
    return response;
    
  } catch (error) {
    console.error('Erro ao entrar no jogo:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    });
  }
});