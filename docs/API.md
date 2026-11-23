# API REST — BuscFísica

Base local: `http://localhost:3000`. Todas as respostas usam JSON. As rotas de conteúdo exigem `Authorization: Bearer <JWT>`.

## Autenticação

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/registrar` | Público | Cria conta comum (`user`) |
| POST | `/auth/login` | Público | Valida credenciais e retorna JWT com validade de 4 horas |

Cadastro:
```json
{ "nome": "Nome", "email": "aluno@email.com", "password": "senha-com-8-ou-mais" }
```

Login:
```json
{ "email": "aluno@email.com", "password": "senha-com-8-ou-mais" }
```

As senhas são armazenadas com hash bcrypt. O cadastro público nunca permite escolher o perfil `admin`.

## Saúde

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/` | Público | Identificação da API |
| GET | `/health` | Público | Verifica a conexão com PostgreSQL |

## Consultas (JWT obrigatório)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/questoes` | Lista questões e alternativas, sem expor o gabarito |
| GET | `/questoes/:id` | Retorna detalhes, gabarito e explicação da questão |
| GET | `/questoes/filtro?vestibular=&materia=&topico=` | Filtra questões por texto parcial |
| GET | `/vestibulares` | Lista vestibulares |
| GET | `/materia` | Lista matérias |
| GET | `/topico` | Lista tópicos |
| GET | `/dificuldade` | Lista níveis de dificuldade |
| GET | `/usuario` | Lista usuários (admin) |
| GET | `/usuario/:id` | Detalha usuário (admin) |

O gabarito não é retornado na listagem. O frontend/mobile solicita `/questoes/:id` somente quando o estudante escolhe conferir a resposta.

## Escrita administrativa

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/questoes` | Admin + JWT | Cadastra questão |
| PUT | `/questoes/:id` | Admin + JWT | Atualiza questão |
| DELETE | `/questoes/:id` | Admin + JWT | Remove questão |

O corpo de criação/edição deve conter `idvest`, `idresp`, `idtopico`, `graudif`, `ano`, `enunciado`, `alt_a`, `alt_b`, `alt_c` e `alt_d`. `alt_e` e `imagem_url` são opcionais.

## Códigos HTTP

- `200`: consulta/ação concluída.
- `201`: registro criado.
- `400`: dados ou parâmetros inválidos.
- `401`: token ausente, inválido ou expirado; ou credenciais inválidas.
- `403`: usuário sem perfil administrativo.
- `404`: registro não encontrado.
- `409`: e-mail já cadastrado.
- `500`/`503`: falha interna ou indisponibilidade do banco.

Erros retornam `{ "mensagem": "descrição" }`.
