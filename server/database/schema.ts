import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const questions = sqliteTable('questions', (t: any) => ({
     id: t.integer('id').primaryKey({ autoIncrement: true }),
     question: t.text('question').notNull(),
}));

export const answers = sqliteTable('answers', (t: any) => ({
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    questionId: t.integer('question_id').references(() => questions.id),
    isCorrect: t.integer('is_correct').notNull(),
    answer: t.text('answer').notNull(),
}));
