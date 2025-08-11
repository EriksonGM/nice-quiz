<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <!-- Logo/Título -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">🧠 Nice Quiz</h1>
        <p class="text-gray-600">Teste seus conhecimentos!</p>
      </div>

      <!-- Formulário de entrada -->
      <div v-if="!player" class="space-y-6">
        <div>
          <label for="playerName" class="block text-sm font-medium text-gray-700 mb-2">
            Qual é o seu nome?
          </label>
          <input
            id="playerName"
            v-model="playerName"
            type="text"
            placeholder="Digite seu nome..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            @keyup.enter="joinGame"
            :disabled="loading"
          />
        </div>
        
        <button
          @click="joinGame"
          :disabled="!playerName.trim() || loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <Icon name="lucide:loader-2" class="animate-spin mr-2" />
            Entrando...
          </span>
          <span v-else>Entrar no Jogo</span>
        </button>
      </div>

      <!-- Sala de espera -->
      <div v-else-if="session?.status === 'waiting'" class="text-center space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <Icon name="lucide:check-circle" class="text-green-600 text-2xl mb-2" />
          <h2 class="text-xl font-semibold text-green-800 mb-1">
            Bem-vindo, {{ player.name }}! 👋
          </h2>
          <p class="text-green-700">Você está na sala de espera.</p>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Icon name="lucide:clock" class="text-yellow-600 text-2xl mb-2" />
          <h3 class="font-semibold text-yellow-800 mb-2">Aguardando início da sessão...</h3>
          <p class="text-yellow-700 text-sm mb-3">
            A sessão começará em breve. Quando iniciada, você terá 10 minutos para responder o máximo de perguntas possível!
          </p>
          <div class="flex items-center justify-center space-x-2">
            <div class="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-semibold text-blue-800 mb-2">Jogadores na sala:</h4>
          <div class="space-y-1">
            <div v-for="p in waitingPlayers" :key="p.id" class="flex items-center text-blue-700">
              <Icon name="lucide:user" class="mr-2 text-sm" />
              <span class="text-sm">{{ p.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Jogo ativo - redirecionar -->
      <div v-else-if="session?.status === 'active'" class="text-center space-y-4">
        <Icon name="lucide:play-circle" class="text-green-600 text-4xl" />
        <h2 class="text-xl font-semibold text-gray-800">Sessão iniciada!</h2>
        <p class="text-gray-600">Redirecionando para o jogo...</p>
      </div>

      <!-- Erro -->
      <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center text-red-700">
          <Icon name="lucide:alert-circle" class="mr-2" />
          <span class="text-sm">{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player, GameSession } from '~/types/quiz';

// Estado reativo
const playerName = ref('');
const player = ref<Player | null>(null);
const session = ref<GameSession | null>(null);
const loading = ref(false);
const error = ref('');
const waitingPlayers = ref<Player[]>([]);

// Cookie para armazenar dados do player
const playerCookie = useCookie('player');

// Verificar se já existe um player logado
onMounted(async () => {
  if (playerCookie.value) {
    player.value = playerCookie.value;
    
    // Verificar status da sessão
    try {
      const response = await $fetch('/api/game/status');
      session.value = response.session;
      waitingPlayers.value = response.players;
      
      // Se a sessão está ativa, redirecionar para o jogo
      if (session.value?.status === 'active') {
        await navigateTo('/game');
        return;
      }
      
      // Se há uma sessão em espera, iniciar polling
      if (session.value?.status === 'waiting') {
        startPolling();
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      // Limpar cookie se houver erro
      playerCookie.value = null;
      player.value = null;
    }
  }
});

// Função para entrar no jogo
const joinGame = async () => {
  if (!playerName.value.trim()) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await $fetch('/api/game/join', {
      method: 'POST',
      body: { playerName: playerName.value.trim() }
    });
    
    player.value = response.player;
    session.value = response.session;
    
    // Salvar player no cookie
    playerCookie.value = response.player;
    
    // Iniciar polling para atualizações
    startPolling();
  } catch (err: any) {
    error.value = err.data?.message || 'Erro ao entrar no jogo';
  } finally {
    loading.value = false;
  }
};

// Polling para atualizações da sessão
let pollingInterval: NodeJS.Timeout;

const startPolling = () => {
  pollingInterval = setInterval(async () => {
    try {
      const response = await $fetch('/api/game/status');
      session.value = response.session;
      waitingPlayers.value = response.players;
      
      // Se a sessão começou, redirecionar para o jogo
      if (session.value?.status === 'active') {
        await navigateTo('/game');
      }
    } catch (err) {
      console.error('Erro ao buscar status:', err);
    }
  }, 2000); // Atualizar a cada 2 segundos
};

// Limpar polling ao sair da página
onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});

// Meta tags
useHead({
  title: 'Nice Quiz - Entre no Jogo',
  meta: [
    { name: 'description', content: 'Entre no Nice Quiz e teste seus conhecimentos!' }
  ]
});
</script>