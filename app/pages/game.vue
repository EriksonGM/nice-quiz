<template>
  <div class="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
    <!-- Header com informações da sessão -->
    <div class="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-gray-800">🧠 Nice Quiz</h1>
          <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Sessão Ativa
          </div>
        </div>
        
        <div class="flex items-center space-x-6">
          <!-- Timer -->
          <div class="flex items-center space-x-2">
            <Icon name="lucide:clock" class="text-red-500" />
            <span class="font-mono text-lg font-bold" :class="timeRemaining < 60 ? 'text-red-500' : 'text-gray-700'">
              {{ formatTime(timeRemaining) }}
            </span>
          </div>
          
          <!-- Pontuação -->
          <div class="flex items-center space-x-2">
            <Icon name="lucide:star" class="text-yellow-500" />
            <span class="font-bold text-lg text-gray-700">{{ playerScore }} pts</span>
          </div>
          
          <!-- Perguntas respondidas -->
          <div class="flex items-center space-x-2">
            <Icon name="lucide:check-circle" class="text-blue-500" />
            <span class="text-gray-700">{{ questionsAnswered }} perguntas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Área principal do jogo -->
    <div class="max-w-4xl mx-auto">
      <!-- Pergunta atual -->
      <div v-if="currentQuestion && !showResult" class="bg-white rounded-xl shadow-xl p-8 mb-6">
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ currentQuestion.category }}
            </span>
            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ currentQuestion.difficulty }} - {{ currentQuestion.points }} pts
            </span>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-800 leading-relaxed">
            {{ currentQuestion.question }}
          </h2>
        </div>
        
        <!-- Opções de resposta -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="answer in currentQuestion.answers"
            :key="answer.id"
            @click="submitAnswer(answer.id)"
            :disabled="submittingAnswer"
            class="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="font-medium text-gray-800">{{ answer.answer }}</span>
          </button>
        </div>
        
        <div v-if="submittingAnswer" class="mt-6 text-center">
          <Icon name="lucide:loader-2" class="animate-spin text-blue-500 text-xl" />
          <span class="ml-2 text-gray-600">Enviando resposta...</span>
        </div>
      </div>
      
      <!-- Resultado da resposta -->
      <div v-if="showResult" class="bg-white rounded-xl shadow-xl p-8 mb-6">
        <div class="text-center">
          <div v-if="lastAnswerCorrect" class="text-green-600 mb-4">
            <Icon name="lucide:check-circle" class="text-6xl mb-2" />
            <h3 class="text-2xl font-bold">Correto! 🎉</h3>
            <p class="text-lg">+{{ lastPointsEarned }} pontos</p>
          </div>
          
          <div v-else class="text-red-600 mb-4">
            <Icon name="lucide:x-circle" class="text-6xl mb-2" />
            <h3 class="text-2xl font-bold">Incorreto 😔</h3>
            <p class="text-lg">Tente a próxima!</p>
          </div>
          
          <div class="mt-6">
            <p class="text-gray-600 mb-4">Próxima pergunta em:</p>
            <div class="text-3xl font-bold text-blue-600">{{ nextQuestionCountdown }}</div>
          </div>
        </div>
      </div>
      
      <!-- Carregando próxima pergunta -->
      <div v-if="loadingQuestion" class="bg-white rounded-xl shadow-xl p-8 text-center">
        <Icon name="lucide:loader-2" class="animate-spin text-blue-500 text-4xl mb-4" />
        <h3 class="text-xl font-semibold text-gray-700">Carregando próxima pergunta...</h3>
      </div>
      
      <!-- Sessão finalizada -->
      <div v-if="session?.status === 'finished'" class="bg-white rounded-xl shadow-xl p-8 text-center">
        <Icon name="lucide:flag" class="text-blue-500 text-6xl mb-4" />
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Sessão Finalizada!</h2>
        <div class="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 class="text-xl font-semibold text-blue-800 mb-2">Seus Resultados:</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ playerScore }}</div>
              <div class="text-sm text-blue-700">Pontos</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ questionsAnswered }}</div>
              <div class="text-sm text-green-700">Perguntas</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">{{ Math.round((correctAnswers / questionsAnswered) * 100) || 0 }}%</div>
              <div class="text-sm text-purple-700">Acertos</div>
            </div>
          </div>
        </div>
        
        <div class="space-x-4">
          <NuxtLink to="/dashboard" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Ver Dashboard
          </NuxtLink>
          <NuxtLink to="/" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Novo Jogo
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question, GameSession } from '~/types/quiz';

// Estado reativo
const currentQuestion = ref<Question | null>(null);
const session = ref<GameSession | null>(null);
const timeRemaining = ref(600); // 10 minutos
const playerScore = ref(0);
const questionsAnswered = ref(0);
const correctAnswers = ref(0);
const submittingAnswer = ref(false);
const loadingQuestion = ref(false);
const showResult = ref(false);
const lastAnswerCorrect = ref(false);
const lastPointsEarned = ref(0);
const nextQuestionCountdown = ref(3);

// Verificar se o jogador está logado
const player = useCookie('player');
if (!player.value) {
  await navigateTo('/');
}

// Função para formatar tempo
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Função para enviar resposta
const submitAnswer = async (answerId: number) => {
  if (!currentQuestion.value || submittingAnswer.value) return;
  
  submittingAnswer.value = true;
  
  try {
    const response = await $fetch('/api/game/answer', {
      method: 'POST',
      body: {
        playerId: player.value.id,
        questionId: currentQuestion.value.id,
        answerId
      }
    });
    
    // Atualizar estatísticas
    lastAnswerCorrect.value = response.isCorrect;
    lastPointsEarned.value = response.pointsEarned;
    playerScore.value = response.totalScore;
    questionsAnswered.value++;
    
    if (response.isCorrect) {
      correctAnswers.value++;
    }
    
    // Mostrar resultado
    showResult.value = true;
    
    // Countdown para próxima pergunta
    nextQuestionCountdown.value = 3;
    const countdownInterval = setInterval(() => {
      nextQuestionCountdown.value--;
      if (nextQuestionCountdown.value <= 0) {
        clearInterval(countdownInterval);
        showResult.value = false;
        loadNextQuestion();
      }
    }, 1000);
    
  } catch (error) {
    console.error('Erro ao enviar resposta:', error);
  } finally {
    submittingAnswer.value = false;
  }
};

// Função para carregar próxima pergunta
const loadNextQuestion = async () => {
  loadingQuestion.value = true;
  
  try {
    const response = await $fetch('/api/game/next-question', {
      query: { playerId: player.value.id }
    });
    
    currentQuestion.value = response.question;
  } catch (error) {
    console.error('Erro ao carregar pergunta:', error);
  } finally {
    loadingQuestion.value = false;
  }
};

// Timer da sessão
let sessionTimer: NodeJS.Timeout;

const startSessionTimer = () => {
  sessionTimer = setInterval(() => {
    timeRemaining.value--;
    
    if (timeRemaining.value <= 0) {
      clearInterval(sessionTimer);
      // Sessão finalizada
      session.value = { ...session.value!, status: 'finished' };
    }
  }, 1000);
};

// Polling para status da sessão
let statusPolling: NodeJS.Timeout;

const startStatusPolling = () => {
  statusPolling = setInterval(async () => {
    try {
      const response = await $fetch('/api/game/status');
      session.value = response.session;
      
      if (response.session.status === 'finished') {
        clearInterval(statusPolling);
        clearInterval(sessionTimer);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  }, 5000);
};

// Inicialização
onMounted(async () => {
  // Verificar status da sessão
  try {
    const response = await $fetch('/api/game/status');
    session.value = response.session;
    
    if (session.value?.status !== 'active') {
      await navigateTo('/');
      return;
    }
    
    // Carregar primeira pergunta
    await loadNextQuestion();
    
    // Iniciar timers
    startSessionTimer();
    startStatusPolling();
    
  } catch (error) {
    console.error('Erro ao inicializar jogo:', error);
    await navigateTo('/');
  }
});

// Limpeza
onUnmounted(() => {
  if (sessionTimer) clearInterval(sessionTimer);
  if (statusPolling) clearInterval(statusPolling);
});

// Meta tags
useHead({
  title: 'Nice Quiz - Jogando',
  meta: [
    { name: 'description', content: 'Responda às perguntas e acumule pontos!' }
  ]
});
</script>