# Plano 003
ADR-001/002 restringem stack, contrato e visual; spec.md fixa as regras.
1. Guard/membership, sessão e endpoints Zod (CA-01/02/06).
2. Repository transacional: lock membership → equipamento; validar e criar; índice parcial (CA-03/04/05).
3. OpenAPI dos DTOs, cliente Orval versionado, integração das telas reais (CA-07/08).
4. Testes unitários, PostgreSQL/Testcontainers, RLS sem bypass e Playwright; verificador com prova negativa (CA-09).
