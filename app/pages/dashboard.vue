<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">📊 Dashboard - Nice Quiz</h1>
          <p class="text-gray-600">Acompanhe o progresso da sessão em tempo real</p>
        </div>
        
        <div class="text-right">
          <div class="text-sm text-gray-500 mb-1">Última atualização</div>
          <div class="text-lg font-mono text-gray-700">{{ lastUpdate }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Status da Sessão -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Icon name="lucide:activity" class="mr-2 text-blue-500" />
            Status da Sessão
          </h2>
          
          <div class="space-y-4">
            <!-- Status atual -->
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Status:</span>
              <span class="px-3 py-1 rounded-full text-sm font-medium" :class="statusClasses">
                {{ statusText }}
              </span>
            </div>
            
            <!-- Timer -->
            <div v-if="session?.status === 'active'" class="flex items-center justify-between">
              <span class="text-gray-600">Tempo restante:</span>
              <span class="font-mono text-lg font-bold" :class="timeRemaining < 60 ? 'text-red-500' : 'text-green-600'">
                {{ formatTime(timeRemaining) }}
              </span>
            </div>
            
            <!-- Duração total -->
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Duração:</span>
              <span class="font-medium">{{ Math.floor((session?.duration || 600) / 60) }} minutos</span>
            </div>
            
            <!-- Horário de início -->
            <div v-if="session?.startTime" class="flex items-center justify-between">
              <span class="text-gray-600">Início:</span>
              <span class="font-medium">{{ formatDateTime(session.startTime) }}</span>
            </div>
            
            <!-- Horário de fim -->
            <div v-if="session?.endTime" class="flex items-center justify-between">
              <span class="text-gray-600">Fim:</span>
              <span class="font-medium">{{ formatDateTime(session.endTime) }}</span>
            </div>
          </div>
          
          <!-- Controles de administração -->
          <div class="mt-6 space-y-2">
            <button
              v-if="session?.status === 'waiting'"
              @click="startSession"
              :disabled="players.length === 0 || loading"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Icon v-if="loading" name="lucide:loader-2" class="animate-spin mr-2" />
              {{ loading ? 'Iniciando...' : 'Iniciar Sessão' }}
            </button>
            
            <button
              v-if="session?.status === 'active'"
              @click="endSession"
              :disabled="loading"
              class="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Icon v-if="loading" name="lucide:loader-2" class="animate-spin mr-2" />
              {{ loading ? 'Finalizando...' : 'Finalizar Sessão' }}
            </button>
            
            <button
              @click="refreshData"
              :disabled="loading"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Icon name="lucide:refresh-cw" class="mr-2" :class="{ 'animate-spin': loading }" />
              Atualizar
            </button>
          </div>
        </div>
        
        <!-- Estatísticas gerais -->
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Icon name="lucide:bar-chart" class="mr-2 text-purple-500" />
            Estatísticas
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ players.length }}</div>
              <div class="text-sm text-blue-700">Jogadores</div>
            </div>
            
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ totalQuestions }}</div>
              <div class="text-sm text-green-700">Perguntas</div>
            </div>
            
            <div class="text-center p-3 bg-yellow-50 rounded-lg">
              <div class="text-2xl font-bold text-yellow-600">{{ averageScore }}</div>
              <div class="text-sm text-yellow-700">Média</div>
            </div>
            
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ topScore }}</div>
              <div class="text-sm text-purple-700">Maior</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Lista de Jogadores -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800 flex items-center">
              <Icon name="lucide:users" class="mr-2 text-green-500" />
              Ranking de Jogadores
            </h2>
            
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <Icon name="lucide:clock" />
              <span>Atualização automática a cada 3s</span>
            </div>
          </div>
          
          <!-- Tabela de jogadores -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Jogador</th>
                  <th class="text-center py-3 px-4 font-semibold text-gray-700">Pontos</th>
                  <th class="text-center py-3 px-4 font-semibold text-gray-700">Perguntas</th>
                  <th class="text-center py-3 px-4 font-semibold text-gray-700">Acertos</th>
                  <th class="text-center py-3 px-4 font-semibold text-gray-700">Taxa</th>
                  <th class="text-center py-3 px-4 font-semibold text-gray-700">Entrada</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(player, index) in sortedPlayers"
                  :key="player.id"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4">
                    <div class="flex items-center">
                      <span class="font-bold text-lg" :class="getRankColor(index)">
                        {{ index + 1 }}
                      </span>
                      <Icon
                        v-if="index === 0 && player.totalScore > 0"
                        name="lucide:crown"
                        class="ml-2 text-yellow-500"
                      />
                    </div>
                  </td>
                  
                  <td class="py-3 px-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {{ player.name.charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-medium text-gray-800">{{ player.name }}</span>
                    </div>
                  </td>
                  
                  <td class="py-3 px-4 text-center">
                    <span class="font-bold text-lg text-blue-600">{{ player.totalScore }}</span>
                  </td>
                  
                  <td class="py-3 px-4 text-center">
                    <span class="text-gray-700">{{ player.questionsAnswered }}</span>
                  </td>
                  
                  <td class="py-3 px-4 text-center">
                    <span class="text-green-600 font-medium">{{ player.correctAnswers }}</span>
                  </td>
                  
                  <td class="py-3 px-4 text-center">
                    <span class="font-medium" :class="getAccuracyColor(player)">
                      {{ getAccuracyPercentage(player) }}%
                    </span>
                  </td>
                  
                  <td class="py-3 px-4 text-center text-sm text-gray-500">
                    {{ formatTime(player.joinedAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Estado vazio -->
            <div v-if="players.length === 0" class="text-center py-12">
              <Icon name="lucide:users" class="text-gray-400 text-4xl mb-4" />
              <h3 class="text-lg font-medium text-gray-500 mb-2">Nenhum jogador conectado</h3>
              <p class="text-gray-400">Os jogadores aparecerão aqui quando se conectarem</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player, GameSession } from '~/types/quiz';

// Estado reativo
const session = ref<GameSession | null>(null);
const players = ref<Player[]>([]);
const loading = ref(false);
const lastUpdate = ref('');
const timeRemaining = ref(0);

// Computed properties
const statusClasses = computed(() => {
  switch (session.value?.status) {
    case 'waiting': return 'bg-yellow-100 text-yellow-800';
    case 'active': return 'bg-green-100 text-green-800';
    case 'finished': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
});

const statusText = computed(() => {
  switch (session.value?.status) {
    case 'waiting': return 'Aguardando';
    case 'active': return 'Ativa';
    case 'finished': return 'Finalizada';
    default: return 'Desconhecido';
  }
});

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.questionsAnswered - a.questionsAnswered;
  });
});

const totalQuestions = computed(() => {
  return players.value.reduce((sum, player) => sum + player.questionsAnswered, 0);
});

const averageScore = computed(() => {
  if (players.value.length === 0) return 0;
  const total = players.value.reduce((sum, player) => sum + player.totalScore, 0);
  return Math.round(total / players.value.length);
});

const topScore = computed(() => {
  if (players.value.length === 0) return 0;
  return Math.max(...players.value.map(p => p.totalScore));
});

// Funções utilitárias
const formatTime = (seconds: number | string) => {
  if (typeof seconds === 'string') {
    return new Date(seconds).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR');
};

const getRankColor = (index: number) => {
  switch (index) {
    case 0: return 'text-yellow-600'; // Ouro
    case 1: return 'text-gray-500';   // Prata
    case 2: return 'text-orange-600'; // Bronze
    default: return 'text-gray-700';
  }
};

const getAccuracyPercentage = (player: Player) => {
  if (player.questionsAnswered === 0) return 0;
  return Math.round((player.correctAnswers / player.questionsAnswered) * 100);
};

const getAccuracyColor = (player: Player) => {
  const accuracy = getAccuracyPercentage(player);
  if (accuracy >= 80) return 'text-green-600';
  if (accuracy >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

// Funções de API
const refreshData = async () => {
  loading.value = true;
  
  try {
    const response = await $fetch('/api/dashboard');
    session.value = response.session;
    players.value = response.players;
    
    // Calcular tempo restante se a sessão estiver ativa
    if (session.value?.status === 'active' && session.value.startTime) {
      const startTime = new Date(session.value.startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      timeRemaining.value = Math.max(0, (session.value.duration || 600) - elapsed);
    }
    
    lastUpdate.value = new Date().toLocaleTimeString('pt-BR');
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  } finally {
    loading.value = false;
  }
};

const startSession = async () => {
  loading.value = true;
  
  try {
    await $fetch('/api/admin/start-session', { method: 'POST' });
    await refreshData();
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error);
  } finally {
    loading.value = false;
  }
};

const endSession = async () => {
  loading.value = true;
  
  try {
    await $fetch('/api/admin/end-session', { method: 'POST' });
    await refreshData();
  } catch (error) {
    console.error('Erro ao finalizar sessão:', error);
  } finally {
    loading.value = false;
  }
};

// Timer para atualização automática
let autoRefreshInterval: NodeJS.Timeout;
let sessionTimer: NodeJS.Timeout;

const startAutoRefresh = () => {
  autoRefreshInterval = setInterval(refreshData, 3000); // A cada 3 segundos
};

const startSessionTimer = () => {
  sessionTimer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    }
  }, 1000);
};

// Inicialização
onMounted(async () => {
  await refreshData();
  startAutoRefresh();
  
  if (session.value?.status === 'active') {
    startSessionTimer();
  }
});

// Limpeza
onUnmounted(() => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  if (sessionTimer) clearInterval(sessionTimer);
});

// Meta tags
useHead({
  title: 'Dashboard - Nice Quiz',
  meta: [
    { name: 'description', content: 'Acompanhe o progresso da sessão de quiz em tempo real' }
  ]
});
</script>