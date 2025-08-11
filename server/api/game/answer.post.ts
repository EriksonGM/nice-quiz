import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { players, answers, questions, playerAnswers } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import type { SubmitAnswerRequest, SubmitAnswerResponse } from '~/types/quiz';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<SubmitAnswerRequest>(event);
    
    if (!body.playerId || !body.questionId || !body.answerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados incompletos'
      });
    }
    
    // Verificar se a resposta existe e se está correta
    const answer = await db.select()
      .from(answers)
      .where(and(
        eq(answers.id, body.answerId),
        eq(answers.questionId, body.questionId)
      ))
      .limit(1)
      .then(rows => rows[0]);
    
    if (!answer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Resposta não encontrada'
      });
    }
    
    // Buscar a pergunta para obter os pontos
    const question = await db.select()
      .from(questions)
      .where(eq(questions.id, body.questionId))
      .limit(1)
      .then(rows => rows[0]);
    
    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Pergunta não encontrada'
      });
    }
    
    // Verificar se o jogador já respondeu esta pergunta
    const existingAnswer = await db.select()
      .from(playerAnswers)
      .where(and(
        eq(playerAnswers.playerId, body.playerId),
        eq(playerAnswers.questionId, body.questionId)
      ))
      .limit(1)
      .then(rows => rows[0]);
    
    if (existingAnswer) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Pergunta já foi respondida'
      });
    }
    
    // Calcular pontos
    const isCorrect = answer.isCorrect;
    const pointsEarned = isCorrect ? question.points : 0;
    
    // Registrar a resposta do jogador
    await db.insert(playerAnswers)
      .values({
        playerId: body.playerId,
        questionId: body.questionId,
        answerId: body.answerId,
        isCorrect,
        pointsEarned
      });
    
    // Atualizar estatísticas do jogador
    const player = await db.select()
      .from(players)
      .where(eq(players.id, body.playerId))
      .limit(1)
      .then(rows => rows[0]);
    
    if (!player) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Jogador não encontrado'
      });
    }
    
    const newTotalScore = player.totalScore + pointsEarned;
    const newQuestionsAnswered = player.questionsAnswered + 1;
    const newCorrectAnswers = player.correctAnswers + (isCorrect ? 1 : 0);
    
    await db.update(players)
      .set({
        totalScore: newTotalScore,
        questionsAnswered: newQuestionsAnswered,
        correctAnswers: newCorrectAnswers
      })
      .where(eq(players.id, body.playerId));
    
    const response: SubmitAnswerResponse = {
      isCorrect,
      pointsEarned,
      totalScore: newTotalScore
    };
    
    return response;
    
  } catch (error) {
    console.error('Erro ao enviar resposta:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    });
  }
});