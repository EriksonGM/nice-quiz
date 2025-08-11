import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { questions, answers, playerAnswers } from '../../database/schema';
import { eq, notInArray, sql } from 'drizzle-orm';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const playerId = Number(query.playerId);
    
    if (!playerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do jogador é obrigatório'
      });
    }
    
    // Buscar perguntas já respondidas pelo jogador
    const answeredQuestions = await db.select({ questionId: playerAnswers.questionId })
      .from(playerAnswers)
      .where(eq(playerAnswers.playerId, playerId));
    
    const answeredQuestionIds = answeredQuestions.map(aq => aq.questionId);
    
    // Buscar uma pergunta aleatória que não foi respondida
    let availableQuestions;
    
    if (answeredQuestionIds.length > 0) {
      availableQuestions = await db.select()
        .from(questions)
        .where(notInArray(questions.id, answeredQuestionIds))
        .orderBy(sql`RANDOM()`)
        .limit(1);
    } else {
      availableQuestions = await db.select()
        .from(questions)
        .orderBy(sql`RANDOM()`)
        .limit(1);
    }
    
    if (availableQuestions.length === 0) {
      // Não há mais perguntas disponíveis
      return {
        question: null,
        message: 'Não há mais perguntas disponíveis'
      };
    }
    
    const question = availableQuestions[0];
    
    // Buscar as respostas para esta pergunta
    const questionAnswers = await db.select()
      .from(answers)
      .where(eq(answers.questionId, question.id))
      .orderBy(sql`RANDOM()`); // Embaralhar as respostas
    
    return {
      question: {
        ...question,
        answers: questionAnswers
      }
    };
    
  } catch (error) {
    console.error('Erro ao buscar próxima pergunta:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    });
  }
});