# Stable — front-end

Aplicação web interna, em português do Brasil, para consultar equipamentos de
TI. O catálogo lê `GET /v1/equipamentos`; empréstimos, devoluções, Operações e
cadastros são demonstrações em memória e não persistem na API.

## Requisitos

- Node.js 22 ou compatível com as versões do `package.json`
- npm
- Backend Stable local ou a URL de uma API já publicada
- Projeto Supabase Auth correspondente à API para login real

## Rodar localmente

Na pasta `frontend/`, defina estas variáveis antes de iniciar:

```powershell
$env:VITE_API_URL = "http://localhost:3000"
$env:VITE_SUPABASE_URL = "https://SEU-PROJETO.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "SUA_CHAVE_ANON"
npm install
npm run dev
```

Abra <http://localhost:5173/login>. Sem `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY`, o app entra em modo de demonstração: qualquer e-mail
e senha válidos no formulário entram como Ana Ribeiro. O botão “Entrar como
Operações” ativa o papel de demonstração. O token dessa sessão é falso e a API
real deve recusá-lo; por isso, um erro de autenticação no Catálogo é esperado.

## Tutorial: front + back

O front e a API devem usar o **mesmo projeto Supabase**. Para login real, crie
o usuário pelo painel do Supabase (o cadastro público fica fechado) e adicione
as claims privadas em `app_metadata`:

```json
{
  "tenant_id": "<UUID do tenant suporte_ti criado pelo seed>",
  "papel": "operacoes"
}
```

`tenant_id` é obrigatório para a API. `papel` é opcional; quando ausente, o
usuário entra como colaborador. A aplicação lê `app_metadata.papel`, depois
`app_metadata.role` e, por fim, o claim de topo `papel`; não confia no `role`
de topo do Supabase.

### Opção A — API local

No backend, inicie o PostgreSQL 16 local na porta 5433, rode
`npm run db:reset` e depois `npm run start:dev` (API em
`http://localhost:3000`). No front, use `VITE_API_URL=http://localhost:3000`
e as duas chaves do mesmo projeto Supabase. Sem `FRONT_ORIGIN`, a API permite
origens locais conforme sua configuração atual.

### Opção B — front local e API publicada

Use `VITE_API_URL=https://<api>.vercel.app` (sem acrescentar `/v1`) e as chaves
Supabase correspondentes ao ambiente da API. Confira `https://<api>.vercel.app/health`.
Se a API restringir CORS por `FRONT_ORIGIN`, a origem
`http://localhost:5173` precisa estar permitida. Esta opção lê dados do ambiente
publicado; valide a URL e o ambiente antes de usar.

### Opção C — front na Vercel

Crie um projeto separado para o front, configure o root directory como
`frontend/`, framework Vite, build `npm run build` e output `dist`. Cadastre
`VITE_API_URL`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações
do projeto; mudanças nessas variáveis exigem novo build. A API precisa permitir
a origem pública do front em `FRONT_ORIGIN`.

O servidor de desenvolvimento já fixa a porta 5173. Rode `npm run dev` e abra
<http://localhost:5173/login>.

O deploy não foi executado e não há URL pública confirmada. A configuração de
rewrite SPA deve ser adicionada pelo responsável pelo projeto de deploy antes
da publicação.

## Testes e build

```powershell
npm run test
npm run build
npx playwright install chromium
npm run e2e
```

Os testes E2E interceptam a API com dados controlados. Não dependem do Supabase
nem de backend remoto.

## Diagnóstico

| Sintoma | Causa provável |
|---|---|
| Faixa de modo de desenvolvimento | Chaves Supabase ausentes; sessão e token são simulados |
| HTTP 401 | Projetos Supabase diferentes, token de demonstração ou usuário sem `tenant_id` |
| Erro de CORS | A origem do front não está na configuração `FRONT_ORIGIN` da API |
| “Failed to fetch” | API desligada, URL incorreta ou conexão indisponível |
| Abas de Operações ausentes | Operações permanece disponível somente na demonstração local |

## Estado da prática

- Catálogo e meus empréstimos usam transporte/tipos/validação gerados por Orval de OpenAPI, sem cliente HTTP manual.
- Solicitação persiste na API; UI atualiza catálogo e empréstimos após sucesso. Datas vêm da sessão/POST do servidor.
- Cadastro e Operações demonstrativos só são acessíveis em desenvolvimento; devolução real está fora desta prática.
- Build de produção sem Supabase Auth configurado recusa login.
- Fotos reais e produção dependem do operador. Veja ../docs/operacao-pratica.md e ../ENTREGA.md.
