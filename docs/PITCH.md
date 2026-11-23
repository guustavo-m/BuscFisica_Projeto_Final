# Roteiro do pitch técnico — 10 a 15 minutos

1. **Contexto e problema (1 min):** apresentar o BuscFísica e o público-alvo.
2. **Demonstração Web (2 min):** login, navegação, filtros, questão, explicação e fórmulas.
3. **Arquitetura (2 min):** explicar React/Vite, API Express na Vercel e Supabase PostgreSQL; mostrar o diagrama.
4. **Banco e segurança (2 min):** tabelas e relacionamentos, PK/FK, índices, RLS, bcrypt, JWT e variáveis de ambiente.
5. **Aplicativo Mobile (2 min):** login, listagem, filtros, detalhe, resposta, loading e erro de rede.
6. **Deploy e domínio (1 min):** mostrar URLs reais, HTTPS/certificado e deploy automático pelo GitHub.
7. **Usabilidade (1–2 min):** apresentar participantes anonimizados, tarefas, métricas reais, feedback e melhorias.
8. **Conclusão (1 min):** resultados, limitações conhecidas e próximos passos.

## Checklist antes da apresentação
- [ ] Web acessível pela URL final HTTPS.
- [ ] API responde `/health`.
- [ ] App mobile aponta para a URL de produção.
- [ ] Banco Supabase contém os dados e está acessível pela API.
- [ ] Login de usuário comum funciona.
- [ ] Perfil admin está configurado e operações restritas foram demonstradas.
- [ ] Relatório de usabilidade preenchido com testes reais.
- [ ] README e documentação atualizados com URLs finais.
- [ ] Não há arquivos `.env` ou segredos no GitHub.
