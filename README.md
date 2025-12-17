# Nortus Operator

Aplicação web em **Next.js (App Router)** construída para o desafio da Loomi, com foco em práticas de entrega “production-grade”: **configuração validada em runtime**, **state management previsível**, **testes automatizados** e uma arquitetura **orientada a features**.

## Links

- **Produção:** https://nortus-operator.vercel.app/login
- **Repositório:** https://github.com/LeonardoAlbano/nortus-operator

---

## Sumário

- [Contexto](#contexto)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Arquitetura do projeto](#arquitetura-do-projeto)
- [Rotas](#rotas)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Scripts](#scripts)
- [Testes](#testes)
- [Qualidade de código](#qualidade-de-código)
- [Deploy (Vercel)](#deploy-vercel)
- [Troubleshooting](#troubleshooting)
- [Uso de IA (transparência)](#uso-de-ia-transparência)
- [Próximos passos](#próximos-passos)

---

## Contexto

O **Nortus Operator** consome a **Nortus Challenge API** e implementa os fluxos essenciais esperados na avaliação. O objetivo não foi apenas “funcionar”, mas entregar um projeto com:

- **Comportamento previsível** (UI e estado centralizados por feature)
- **Falha rápida para configuração inválida** (validação de env com Zod)
- **Feedback rápido** (testes + lint + typecheck)
- **Workflow compatível com branch protection** (PR-based)

---

## Funcionalidades

### Autenticação

- Formulário de login com:
  - Validação de e-mail via **Zod** (fonte única de verdade)
  - Mensagens de erro consistentes (evita depender de validação HTML nativa)
  - Toggle de visibilidade de senha
  - Opção “remember” (UX)

### Dashboard

- Consumo de dados agregados via handlers internos
- State via store para previsibilidade e testabilidade

### Tickets

- Listagem com paginação
- Filtros (status e responsável)
- Fluxos de criação/edição com validação em testes (payload esperado)

### Chat

- Renderização a partir de API
- Store para centralizar fetching e estado de UI

### Simulator

- Interações que alteram o valor final estimado
- Comportamento determinístico coberto por testes

---

## Stack

- **Framework:** Next.js (App Router), React 19
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Estado:** Zustand
- **Forms:** react-hook-form
- **Validação:** Zod + @hookform/resolvers
- **i18n:** next-intl
- **Testes:** Vitest, Testing Library, jsdom
- **Tooling:** TypeScript, ESLint, Prettier, Husky, lint-staged, commitlint

---

## Arquitetura do projeto

O projeto segue uma estrutura **orientada a features**, reduzindo acoplamento e facilitando evolução incremental.

```text
src/
  app/
    (public)/
      login/
        _components/
    (app)/
      dashboard/
      tickets/
      chat/
      simulator/
      user/
    api/
      auth/
      nortus/
    layout.tsx
  features/
    auth/
    dashboard/
    tickets/
    chat/
    simulator/
  components/
    ui/
    layout/
  lib/
    env.ts
    nortus-session.ts
    ...
```

### Por que assim?

- `src/features/*`: encapsula UI + store + fluxo de dados por feature
- `src/app/*`: composição de rotas e route handlers
- `src/lib/*`: preocupações transversais (env, sessão, helpers de fetch)

Isso ajuda a manter o projeto escalável e com superfícies bem definidas.

---

## Rotas

### Públicas

- `/login`

### Aplicação

- `/dashboard`
- `/tickets`
- `/chat`
- `/simulator`
- `/user`

### API interna (Route Handlers)

- `/api/auth/*` autenticação
- `/api/nortus/*` camada de integração com a API upstream

A camada de handlers centraliza:

- base URL
- headers e sessão
- consistência de erros
- segurança de configuração

---

## Variáveis de ambiente

A aplicação valida variáveis de ambiente em runtime para evitar deploy com configuração incompleta.

### Obrigatória

```env
NORTUS_API_BASE_URL="https://nortus-challenge.api.stage.loomi.com.br"
```

### Local

Crie `.env.local` na raiz:

```env
NORTUS_API_BASE_URL="https://nortus-challenge.api.stage.loomi.com.br"
```

### Vercel

Project → Settings → Environment Variables  
Adicionar `NORTUS_API_BASE_URL` e aplicar para **Production** e **Preview**.

---

## Como rodar localmente

### Requisitos

- Node.js 22+ (recomendado)
- pnpm (via Corepack)

### Instalação

```bash
pnpm install
```

### Rodar

```bash
pnpm dev
```

Acesso:

```text
http://localhost:3000/login
```

---

## Scripts

```bash
pnpm dev
pnpm build
pnpm start

pnpm test
pnpm test --run

pnpm lint
pnpm typecheck
```

---

## Testes

A suíte prioriza fluxos críticos e comportamento do usuário:

- **Login**
  - render de campos e botão
  - bloqueio de submit com e-mail inválido (Zod)
  - autenticação com input válido

- **Tickets**
  - fetch no mount
  - dialogs (create/edit) com payload esperado

- **Simulator**
  - toggles alteram o valor estimado de forma determinística

Os testes usam Testing Library para validar comportamento e reduzir acoplamento a detalhes internos de implementação.

---

## Qualidade de código

Gates de qualidade adotados:

- Type safety: `pnpm typecheck`
- Lint: `pnpm lint`
- Testes: `pnpm test --run`
- Commits convencionais via `commitlint`
- Pre-commit com `husky` + `lint-staged`

### Exemplos de Conventional Commits

- `fix(auth): validate email with zod and align login tests`
- `chore(app): update metadata and icons`
- `feat(tickets): add responsible filter with search`

---

## Deploy (Vercel)

Recomendação de fluxo:

- **Production branch:** `main`
- **Preview:** PRs (ex.: `develop` → `main`)

Checklist do deploy:

1. Configurar `NORTUS_API_BASE_URL` na Vercel
2. Garantir que o branch de produção esteja atualizado
3. Disparar deploy via merge/push (ou redeploy manual)

---

## Troubleshooting

### Build falha na Vercel com `ZodError` (env undefined)

Sintoma:

- `Invalid input: expected string, received undefined` para `NORTUS_API_BASE_URL`

Causa:

- Variável não configurada no ambiente (Preview/Production)

Correção:

1. Project → Settings → Environment Variables
2. Adicionar `NORTUS_API_BASE_URL`
3. Aplicar para Production + Preview
4. Redeploy

### Push direto bloqueado (branch rules)

Sintoma:

- `Changes must be made through a pull request`

Correção:

- Criar branch → abrir PR → merge

---

## Uso de IA (transparência)

IA foi utilizada como acelerador e assistente de revisão principalmente para:

- Revisão de arquitetura e trade-offs (boundary de stores, estrutura de pastas)
- Melhoria de testes e cobertura de edge cases
- Integração RHF + Zod e padrões de validação
- Checklist de entrega (lint/typecheck/tests) e documentação

Todo output sugerido foi **validado** por:

- Testes automatizados
- Lint e typecheck
- Verificação manual em ambiente local e deploy

---

## Próximos passos

Se o projeto evoluísse além do escopo do desafio:

- Testes E2E (Playwright) para smoke tests (login + tickets)
- Observabilidade (tracking de erros e métricas de performance)
- Estratégia de cache e revalidação para endpoints read-heavy
- Hardening de auth/session (refresh/expiração) se suportado pela API
- Auditoria de acessibilidade (teclado, foco, contrastes)
