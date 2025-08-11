# Nice Quiz 🧠

Uma aplicação moderna de quiz desenvolvida com Nuxt 4, oferecendo uma experiência interativa e envolvente para criação e participação em questionários.

## 📋 Sobre o Projeto

O Nice Quiz é uma plataforma web que permite aos usuários criar, compartilhar e participar de questionários personalizados. Construído com as mais recentes tecnologias web, oferece uma interface moderna e responsiva.

## 🚀 Tecnologias Utilizadas

- **[Nuxt 4](https://nuxt.com/)** - Framework Vue.js para aplicações web modernas
- **[Vue 3](https://vuejs.org/)** - Framework JavaScript progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM TypeScript-first para SQL
- **[LibSQL](https://libsql.org/)** - Banco de dados SQLite compatível
- **[Nuxt Icon](https://nuxt.com/modules/icon)** - Ícones para Nuxt
- **[Nuxt Fonts](https://nuxt.com/modules/fonts)** - Otimização de fontes
- **[Nuxt Image](https://nuxt.com/modules/image)** - Otimização de imagens
- **[ESLint](https://eslint.org/)** - Linter para JavaScript/TypeScript

## 📁 Estrutura do Projeto

```
nice-quiz/
├── app/                    # Código da aplicação Nuxt
│   ├── app.vue            # Componente raiz
│   └── assets/            # Assets estáticos
├── server/                # Código do servidor
│   └── database/          # Configuração do banco de dados
│       ├── schema.ts      # Schema do Drizzle
│       └── migrations/    # Migrações do banco
├── types/                 # Definições de tipos TypeScript
├── public/                # Arquivos públicos estáticos
├── drizzle.config.ts      # Configuração do Drizzle Kit
├── nuxt.config.ts         # Configuração do Nuxt
└── package.json           # Dependências do projeto
```

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18+ 
- pnpm (recomendado)

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd nice-quiz
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na raiz do projeto
DATABASE_URL=sua_url_do_banco
DATABASE_AUTH_TOKEN=seu_token_de_auth
```

## 🚀 Executando o Projeto

### Servidor de Desenvolvimento

Inicie o servidor de desenvolvimento em `http://localhost:3000`:

```bash
pnpm dev
```

### Banco de Dados

Gere e execute migrações do banco de dados:

```bash
# Gerar migrações
npx drizzle-kit generate

# Aplicar migrações
npx drizzle-kit push
```

### Build para Produção

Construa a aplicação para produção:

```bash
pnpm build
```

Visualize o build de produção localmente:

```bash
pnpm preview
```

## 📚 Scripts Disponíveis

- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Constrói a aplicação para produção
- `pnpm preview` - Visualiza o build de produção
- `pnpm generate` - Gera site estático

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, entre em contato através dos issues do GitHub.

---

**Desenvolvido com ❤️ usando Nuxt 4**
