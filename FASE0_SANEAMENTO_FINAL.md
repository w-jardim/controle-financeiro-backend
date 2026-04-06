# FASE0_SANEAMENTO_FINAL

1. ARQUIVOS ANALISADOS

- `PROJECT_STATUS.md`
- `README.md`
- `backend/README.md`
- `CONSOLIDACAO_FINAL_RELATORIO.md` (não encontrado na raiz)
- `FASE0_CONSOLIDACAO_FINAL.md` (não encontrado na raiz)
- `FASE0_ALINHAMENTO_FINAL.md` (não encontrado na raiz)

2. O QUE FOI AJUSTADO NO PROJECT_STATUS.md

- Documento reescrito sem duplicações internas.
- `escalas` e `agenda_aulas` marcados explicitamente como domínio OFICIAL.
- `agenda_aula_id` marcado como TRANSITÓRIO (novo).
- `horario_aula_id` marcado como TRANSITÓRIO (legado).
- `horarios_aula` marcado como LEGADO.
- Rotas backend em `/` marcadas como compatibilidade temporária.
- `Horarios`, `horariosService` e `useHorarios` marcados como transitórios no frontend.
- Tabela explícita de classificação presente em seções: OFICIAL, TRANSITÓRIO, LEGADO e PENDENTE DE REMOÇÃO.

3. ARQUIVOS REMOVIDOS OU ARQUIVADOS

- Removidos da raiz por redundância (já não competem com o status principal):
  - `CONSOLIDACAO_FINAL_RELATORIO.md`
  - `FASE0_CONSOLIDACAO_FINAL.md`
  - `FASE0_ALINHAMENTO_FINAL.md`
- Mantido histórico em `docs/archive/RELATORIO_COMPLETO.md`.

4. COMO O LEGADO FOI MARCADO

- OFICIAL: `escalas`, `agenda_aulas`.
- TRANSITÓRIO: `agenda_aula_id`, `horario_aula_id`, rotas `/` no backend, `Horarios`/`horariosService`/`useHorarios` no frontend.
- LEGADO: `horarios_aula` (tabela) e módulo `horarios-aula`.
- PENDENTE DE REMOÇÃO: rotas `/`, dependências de `horario_aula_id`, tabela `horarios_aula`.

5. TESTES EXECUTADOS

Backend:
- `npm test --silent`
- `npx jest --runInBand tests/integration -i`

Frontend:
- `npm test --silent`
- `npm run build --silent`
- `npm run lint`

6. SAÍDA REAL DOS COMANDOS

Backend `npm test --silent` (execução final):

```
Test Suites: 16 passed, 16 total
Tests:       138 passed, 138 total
Snapshots:   0 total
Time:        348.771 s
Ran all test suites.
```

Backend `npx jest --runInBand tests/integration -i`:

```
Test Suites: 13 passed, 13 total
Tests:       117 passed, 117 total
Snapshots:   0 total
Time:        304.241 s
Ran all test suites matching /tests\\integration/i.
```

Frontend `npm test --silent`:

```
Test Files  5 passed (5)
Tests       18 passed (18)
```

Frontend `npm run build --silent`:

```
vite v5.4.21 building for production...
✓ 188 modules transformed.
✓ built in 3.15s
```

Frontend `npm run lint`:

```
> eslint ./src --ext .ts,.tsx
WARNING: TypeScript 5.9.3 fora da faixa oficialmente suportada por @typescript-eslint/typescript-estree.
```

7. DECISÃO FINAL

- FASE 0 CONCLUÍDA
