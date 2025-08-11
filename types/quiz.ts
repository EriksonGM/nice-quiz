// Tipos para o sistema de quiz

export interface Question {
  id: number;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
  createdAt: string;
  answers: Answer[];
}

export interface Answer {
  id: number;
  questionId: number;
  answer: string;
  isCorrect: boolean;
}

export interface Player {
  id: number;
  name: string;
  sessionId?: number;
  totalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  joinedAt: string;
}

export interface GameSession {
  id: number;
  status: 'waiting' | 'active' | 'finished';
  startTime?: string;
  endTime?: string;
  duration: number; // em segundos
  createdAt: string;
  players?: Player[];
}

export interface PlayerAnswer {
  id: number;
  playerId: number;
  questionId: number;
  answerId: number;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: string;
}

// Tipos para as APIs
export interface JoinGameRequest {
  playerName: string;
}

export interface JoinGameResponse {
  player: Player;
  session: GameSession;
}

export interface SubmitAnswerRequest {
  playerId: number;
  questionId: number;
  answerId: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
}

export interface DashboardData {
  session: GameSession;
  players: Player[];
  timeRemaining?: number;
}

export interface QuizState {
  currentQuestion?: Question;
  timeRemaining: number;
  score: number;
  questionsAnswered: number;
}