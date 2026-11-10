# Stable

Sistema de empréstimo de equipamentos de TI para uso interno, pensado para substituir a planilha compartilhada usada para controlar notebooks, monitores, cabos e câmeras.

## Visão geral

O Stable foi concebido para resolver um problema comum em empresas e instituições: a falta de visibilidade sobre o que está disponível, quem está com cada item e quando o equipamento precisa ser devolvido. A solução centraliza o controle em um app web com dois perfis principais:

- Colaborador: consulta o catálogo, solicita empréstimo de itens disponíveis e devolve o que está com ele.
- Operações: cadastra equipamentos, acompanha todos os empréstimos em aberto e registra as devoluções no balcão.

## Problema de negócio

Hoje, o controle costuma acontecer em planilhas compartilhadas, o que gera:

- baixa visibilidade do inventário;
- dificuldade para saber o que está disponível;
- risco de itens sumirem ou serem devolvidos sem registro;
- ausência de regras automáticas para controlar atrasos e disponibilidade.

## Regras de negócio

A primeira versão do produto define as seguintes regras:

- cada pessoa pode ter no máximo 3 itens emprestados ao mesmo tempo;
- prazo padrão de devolução: 14 dias;
- quem está em atraso não pode solicitar novos empréstimos;
- equipamentos em manutenção não aparecem como disponíveis.

## Status do projeto

Este checkout contém a base da solução com:

- documentação do produto e arquitetura;
- protótipo da interface;
- API em NestJS + Prisma;
- frontend em React + Vite.

O projeto ainda está em evolução. A API já implementa health check e leitura paginada do catálogo, enquanto o frontend possui fluxo real de login quando configurado e consulta de catálogo. Empréstimos, devoluções, operações e cadastro continuam sendo fluxos em demonstração em memória, portanto o sistema ainda não está pronto para substituir completamente a planilha em produção.

## Estrutura do repositório

- `backend/` — API do sistema, construída com NestJS e Prisma.
- `frontend/` — aplicação web em React/Vite.
- `docs/` — documentação do produto, arquitetura, regras e procedimentos.
- `prototipo/` — protótipo navegável da interface.
- `skills/` — materiais de suporte e procedimentos reutilizáveis.
- `agents/` — agentes e automações do projeto.

## Stack tecnológica

### Backend
- Node.js
- NestJS
- Prisma
- PostgreSQL
- Zod
- Jest

### Frontend
- React
- Vite
- TypeScript
- Tailwind
- React Query
- Zustand
- Vitest
- Playwright

## Como rodar localmente

### 1. Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```

O backend usa variáveis de ambiente para configuração local. Ajuste o arquivo `.env` conforme a sua máquina e a configuração do banco.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação fica disponível no navegador em modo de desenvolvimento pelo Vite.

## Documentação relevante

- `docs/PRD.md` — requisitos e regras do negócio.
- `docs/adr/001-stack.md` — decisões de arquitetura.
- `docs/adr/002-layout-design-system.md` — sistema visual e padrões de interface.
- `docs/rules/` — regras operacionais, validação e bons procedimentos do projeto.
- `AGENTS.md` — contexto e convenções do repositório.

## Objetivo final

O Stable pretende oferecer um fluxo simples e confiável para gestão de empréstimos internos de TI, permitindo que a operação seja mais transparente, automatizada e segura do que o uso de planilhas compartilhadas.
