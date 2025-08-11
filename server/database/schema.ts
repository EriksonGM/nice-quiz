import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Tabela de perguntas
export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  question: text('question').notNull(),
  difficulty: text('difficulty').notNull().default('medium'), // easy, medium, hard
  category: text('category').notNull().default('general'),
  points: integer('points').notNull().default(10),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de respostas/opções
export const answers = sqliteTable('answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').notNull().references(() => questions.id),
  answer: text('answer').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
});

// Tabela de jogadores
export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sessionId: integer('session_id').references(() => gameSessions.id),
  totalScore: integer('total_score').notNull().default(0),
  questionsAnswered: integer('questions_answered').notNull().default(0),
  correctAnswers: integer('correct_answers').notNull().default(0),
  joinedAt: text('joined_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de sessões de jogo
export const gameSessions = sqliteTable('game_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  status: text('status').notNull().default('waiting'), // waiting, active, finished
  startTime: text('start_time'),
  endTime: text('end_time'),
  duration: integer('duration').notNull().default(600), // 10 minutos em segundos
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de respostas dos jogadores
export const playerAnswers = sqliteTable('player_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id').notNull().references(() => players.id),
  questionId: integer('question_id').notNull().references(() => questions.id),
  answerId: integer('answer_id').notNull().references(() => answers.id),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  pointsEarned: integer('points_earned').notNull().default(0),
  answeredAt: text('answered_at').default(sql`CURRENT_TIMESTAMP`),
});
