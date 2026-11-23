# Instalação e execução local — BuscFísica

## 1. Requisitos

- Node.js 20+
- npm
- PostgreSQL instalado e em execução
- Um cliente SQL (pgAdmin, DBeaver ou psql)

## 2. Criar o banco

Crie um banco chamado `buscfisica` no PostgreSQL. Depois execute, nessa ordem:

1. `supabase/schema.sql` — cria tabelas, chaves, índices, RLS e a view de listagem.
2. `supabase/seed.sql` — insere matérias, vestibulares, tópicos, respostas e questões.

Alternativamente, use `database/BuscFisica_completo.sql` como script único em um banco vazio. Não execute os dois métodos no mesmo banco, pois os dados iniciais seriam duplicados.

## 3. Iniciar o backend

No terminal:

```bash
cd backend
npm install
```

Copie `backend/.env.example` para `backend/.env` e preencha os dados locais. Exemplo:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=buscfisica
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432
DB_SSL=false
JWT_SECRET=coloque-um-segredo-aleatorio-com-pelo-menos-32-caracteres
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

Inicie:

```bash
npm run dev
```

Confira `http://localhost:3000/health`. O retorno esperado quando o banco está acessível é `{"status":"ok","database":"connected"}`.

## 4. Iniciar o frontend web

Em outro terminal:

```bash
cd frontend
npm install
```

Copie `frontend/.env.example` para `frontend/.env.local`. Mantenha `VITE_API_URL=http://localhost:3000` para desenvolvimento local.

Inicie:

```bash
npm run dev -- --host 0.0.0.0
```

O parâmetro `--host 0.0.0.0` permite que o celular na mesma rede Wi-Fi acesse o frontend para carregar imagens. Abra o endereço indicado pelo Vite, normalmente `http://localhost:5173`.

## 5. Iniciar o aplicativo mobile

Em outro terminal:

```bash
cd mobile
npm install
```

Copie `mobile/.env.example` para `mobile/.env`. Ajuste `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_WEB_URL`:

- Celular físico: `EXPO_PUBLIC_API_URL=http://IP_LOCAL_DO_COMPUTADOR:3000` e `EXPO_PUBLIC_WEB_URL=http://IP_LOCAL_DO_COMPUTADOR:5173` (celular e computador na mesma rede Wi-Fi).
- Emulador Android: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`; configure também `EXPO_PUBLIC_WEB_URL` para o endereço em que o Vite está acessível.
- iOS Simulator: normalmente `EXPO_PUBLIC_API_URL=http://localhost:3000` e `EXPO_PUBLIC_WEB_URL=http://localhost:5173`.

No computador, descubra o IP local com `ipconfig` (Windows). Libere a porta 3000 no firewall se necessário.

Inicie o Expo:

```bash
npx expo start
```

Leia o QR Code com o Expo Go compatível com o SDK configurado. Em build de produção, use somente a URL HTTPS real da API.

## 6. Primeiro acesso

Crie uma conta pela tela de login/cadastro da versão Web ou Mobile. Para promover uma conta de equipe a administradora, execute no banco:

```sql
UPDATE usuario SET tipo = 'admin' WHERE email = 'email-da-equipe@exemplo.com';
```

Nunca permita que um cadastro público defina o próprio perfil como `admin`.

## 7. Problemas comuns

- **Erro de conexão com o banco:** confira serviço PostgreSQL, nome do banco, porta, usuário e senha.
- **Frontend não encontra a API:** confira `VITE_API_URL` e se o backend está ativo.
- **Celular não conecta:** não use `localhost` no celular físico; use o IP local do computador e a mesma rede Wi-Fi.
- **CORS:** ajuste `FRONTEND_ORIGIN` no backend para a origem exata do frontend.
- **Token inválido:** saia da conta e entre novamente; tokens expiram após quatro horas.
