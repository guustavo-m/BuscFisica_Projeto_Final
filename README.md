# BuscFísica

O BuscFísica é uma plataforma de estudos de Física voltada a vestibulandos. O projeto reúne questões de vestibulares, filtros por vestibular, matéria e tópico, correção das respostas, explicações, fórmulas e videoaulas relacionadas.

Este repositório contém três aplicações integradas:

- interface web em React;
- API REST em Node.js e Express;
- aplicativo móvel em React Native com Expo.

## Funcionalidades

- cadastro e autenticação de usuários;
- armazenamento seguro de senha com bcrypt;
- acesso protegido por token JWT;
- consulta de questões por vestibular, matéria e tópico;
- correção individual das alternativas;
- gabarito e explicação disponibilizados somente após a solicitação do usuário;
- consulta de fórmulas de Física;
- área administrativa para usuários com perfil `admin`;
- cadastro, edição e exclusão de questões;
- versão Web responsiva e versão móvel.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Web | React 19, Vite, React Router |
| Mobile | React Native, Expo |
| API | Node.js, Express |
| Banco de dados | PostgreSQL |
| Autenticação | JWT e bcrypt |
| Banco gerenciado opcional | Supabase |

## Estrutura do repositório

```text
BuscFisica_Projeto_Final/
├── backend/                  # API Express
│   └── src/
│       ├── config/           # Configuração do banco
│       ├── controllers/      # Regras das requisições
│       ├── middleware/       # Autenticação e autorização
│       ├── models/           # Consultas ao banco
│       └── routes/           # Rotas da API
├── frontend/                 # Aplicação Web
│   └── src/
│       ├── components/
│       └── pages/
├── mobile/                   # Aplicativo Expo
│   └── src/
│       ├── components/
│       ├── screens/
│       ├── services/
│       └── styles/
├── database/
│   └── BuscFisica_completo.sql
├── supabase/
│   ├── schema.sql
│   └── seed.sql
└── docs/
    ├── INSTALACAO_LOCAL.md
    ├── API.md
    ├── ARQUITETURA.md
    ├── USABILIDADE.md
    ├── PITCH.md
    └── STATUS_DA_ENTREGA.md
```

## Pré-requisitos

- Node.js 20 ou superior;
- npm;
- PostgreSQL em execução;
- pgAdmin, DBeaver ou outro cliente SQL;
- Expo Go ou emulador Android/iOS para testar o aplicativo móvel.

## Configuração rápida

Consulte o guia completo em [docs/INSTALACAO_LOCAL.md](docs/INSTALACAO_LOCAL.md).

### 1. Criar o banco de dados

Crie um banco PostgreSQL chamado `buscfisica`. Em seguida, escolha uma opção:

#### Opção A — scripts separados

Execute nesta ordem:

1. `supabase/schema.sql`;
2. `supabase/seed.sql`.

#### Opção B — script único

Execute `database/BuscFisica_completo.sql` em um banco PostgreSQL vazio.

Não execute os dois métodos no mesmo banco, pois os dados iniciais podem ser duplicados.

### 2. Configurar e iniciar a API

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Preencha as variáveis do arquivo `backend/.env`, especialmente `DB_*`, `JWT_SECRET` e `FRONTEND_ORIGIN`.

- API: `http://localhost:3000`
- Verificação do banco: `http://localhost:3000/health`

### 3. Configurar e iniciar o frontend Web

Em outro terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev -- --host 0.0.0.0
```

Web: `http://localhost:5173`

### 4. Configurar e iniciar o aplicativo móvel

Em outro terminal:

```powershell
cd mobile
npm install
Copy-Item .env.example .env
npx expo start
```

Para celular físico, use o endereço IP do computador no arquivo `mobile/.env` e mantenha celular e computador na mesma rede Wi-Fi.

## Variáveis de ambiente

### Backend

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=buscfisica
DB_PASSWORD=sua_senha
DB_PORT=5432
DB_SSL=false
JWT_SECRET=chave-aleatoria-com-pelo-menos-32-caracteres
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend Web

```env
VITE_API_URL=http://localhost:3000
```

### Aplicativo móvel

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WEB_URL=http://localhost:5173
```

Para emulador Android, normalmente use `http://10.0.2.2:3000` como endereço da API.

## Primeiro acesso

Crie uma conta pela tela de cadastro do frontend ou do aplicativo.

O cadastro público cria somente usuários comuns. Para promover um usuário existente a administrador, execute no PostgreSQL:

```sql
UPDATE usuario
SET tipo = 'admin'
WHERE email = 'email-da-equipe@exemplo.com';
```

Não permita que o cadastro público escolha o perfil `admin`.

## Scripts disponíveis

### Backend

```powershell
cd backend
npm run dev    # inicia com nodemon
npm start      # inicia normalmente
npm test       # executa os testes Node
```

### Frontend

```powershell
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

### Mobile

```powershell
cd mobile
npx expo start
npm run android
npm run ios
npm run web
```

## Segurança

- senhas armazenadas com hash bcrypt;
- rotas de conteúdo protegidas por JWT;
- tokens com validade configurada para quatro horas;
- cadastro público limitado ao perfil `user`;
- operações administrativas restritas ao perfil `admin`;
- gabarito oculto na listagem das questões;
- arquivos `.env` reais não devem ser enviados ao repositório;
- a chave administrativa do Supabase nunca deve ser usada no Web ou Mobile.

## Documentação adicional

- [Guia de instalação](docs/INSTALACAO_LOCAL.md)
- [Referência da API](docs/API.md)
- [Arquitetura do projeto](docs/ARQUITETURA.md)
- [Roteiro de usabilidade](docs/USABILIDADE.md)
- [Roteiro de apresentação](docs/PITCH.md)
- [Estado da entrega](docs/STATUS_DA_ENTREGA.md)

## Estado do projeto

O código está preparado para testes locais nas versões Web, Mobile e API. Banco PostgreSQL, dependências, testes com participantes e publicação em ambiente externo ainda precisam ser concluídos ou validados no computador da equipe.
