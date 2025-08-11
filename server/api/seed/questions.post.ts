import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { questions, answers } from '../../database/schema';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

const sampleQuestions = [
  {
    question: 'Qual é a capital do Brasil?',
    category: 'Geografia',
    difficulty: 'easy',
    points: 10,
    answers: [
      { answer: 'Brasília', isCorrect: true },
      { answer: 'São Paulo', isCorrect: false },
      { answer: 'Rio de Janeiro', isCorrect: false },
      { answer: 'Salvador', isCorrect: false }
    ]
  },
  {
    question: 'Quem pintou a Mona Lisa?',
    category: 'Arte',
    difficulty: 'medium',
    points: 15,
    answers: [
      { answer: 'Leonardo da Vinci', isCorrect: true },
      { answer: 'Michelangelo', isCorrect: false },
      { answer: 'Pablo Picasso', isCorrect: false },
      { answer: 'Vincent van Gogh', isCorrect: false }
    ]
  },
  {
    question: 'Qual é o maior planeta do sistema solar?',
    category: 'Ciência',
    difficulty: 'easy',
    points: 10,
    answers: [
      { answer: 'Júpiter', isCorrect: true },
      { answer: 'Saturno', isCorrect: false },
      { answer: 'Terra', isCorrect: false },
      { answer: 'Marte', isCorrect: false }
    ]
  },
  {
    question: 'Em que ano foi descoberto o Brasil?',
    category: 'História',
    difficulty: 'medium',
    points: 15,
    answers: [
      { answer: '1500', isCorrect: true },
      { answer: '1492', isCorrect: false },
      { answer: '1498', isCorrect: false },
      { answer: '1502', isCorrect: false }
    ]
  },
  {
    question: 'Qual é a fórmula química da água?',
    category: 'Química',
    difficulty: 'easy',
    points: 10,
    answers: [
      { answer: 'H2O', isCorrect: true },
      { answer: 'CO2', isCorrect: false },
      { answer: 'O2', isCorrect: false },
      { answer: 'H2SO4', isCorrect: false }
    ]
  },
  {
    question: 'Quem escreveu "Dom Casmurro"?',
    category: 'Literatura',
    difficulty: 'medium',
    points: 15,
    answers: [
      { answer: 'Machado de Assis', isCorrect: true },
      { answer: 'José de Alencar', isCorrect: false },
      { answer: 'Clarice Lispector', isCorrect: false },
      { answer: 'Jorge Amado', isCorrect: false }
    ]
  },
  {
    question: 'Qual é o resultado de 15 × 8?',
    category: 'Matemática',
    difficulty: 'easy',
    points: 10,
    answers: [
      { answer: '120', isCorrect: true },
      { answer: '110', isCorrect: false },
      { answer: '130', isCorrect: false },
      { answer: '125', isCorrect: false }
    ]
  },
  {
    question: 'Qual é o menor país do mundo?',
    category: 'Geografia',
    difficulty: 'hard',
    points: 20,
    answers: [
      { answer: 'Vaticano', isCorrect: true },
      { answer: 'Monaco', isCorrect: false },
      { answer: 'San Marino', isCorrect: false },
      { answer: 'Liechtenstein', isCorrect: false }
    ]
  },
  {
    question: 'Quantos ossos tem o corpo humano adulto?',
    category: 'Biologia',
    difficulty: 'hard',
    points: 20,
    answers: [
      { answer: '206', isCorrect: true },
      { answer: '208', isCorrect: false },
      { answer: '204', isCorrect: false },
      { answer: '210', isCorrect: false }
    ]
  },
  {
    question: 'Qual é a velocidade da luz no vácuo?',
    category: 'Física',
    difficulty: 'hard',
    points: 20,
    answers: [
      { answer: '299.792.458 m/s', isCorrect: true },
      { answer: '300.000.000 m/s', isCorrect: false },
      { answer: '299.000.000 m/s', isCorrect: false },
      { answer: '298.792.458 m/s', isCorrect: false }
    ]
  }
];

export default defineEventHandler(async (event) => {
  try {
    // Verificar se já existem perguntas
    const existingQuestions = await db.select().from(questions).limit(1);
    
    if (existingQuestions.length > 0) {
      return {
        success: false,
        message: 'Perguntas já foram inseridas anteriormente'
      };
    }
    
    let insertedCount = 0;
    
    // Inserir cada pergunta com suas respostas
    for (const questionData of sampleQuestions) {
      // Inserir pergunta
      const [insertedQuestion] = await db.insert(questions)
        .values({
          question: questionData.question,
          category: questionData.category,
          difficulty: questionData.difficulty,
          points: questionData.points
        })
        .returning();
      
      // Inserir respostas
      for (const answerData of questionData.answers) {
        await db.insert(answers)
          .values({
            questionId: insertedQuestion.id,
            answer: answerData.answer,
            isCorrect: answerData.isCorrect
          });
      }
      
      insertedCount++;
    }
    
    return {
      success: true,
      message: `${insertedCount} perguntas inseridas com sucesso`,
      count: insertedCount
    };
    
  } catch (error) {
    console.error('Erro ao inserir perguntas:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    });
  }
});