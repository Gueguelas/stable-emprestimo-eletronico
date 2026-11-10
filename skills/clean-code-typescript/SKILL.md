---
name: clean-code-typescript
description: "Use when creating, changing, reviewing, or refactoring TypeScript code to improve readability, maintainability, and testability while preserving project behavior and conventions."
---

# Clean Code TypeScript

Apply this workflow to make TypeScript changes easier to understand and maintain. Treat clean-code principles as guidance, not as a reason to expand scope or redesign working code.

## When to Use

- Implementing a bounded TypeScript change.
- Reviewing or refactoring TypeScript for clarity or maintainability.
- Reducing duplication or improving testability without changing behavior.

## Procedure

1. Read the repository instructions that apply to the target. In this project, start with [RESTRICTIONS](../../docs/rules/RESTRICTIONS.md), [operacoes](../../docs/rules/operacoes.md), and [clean-code](../../docs/rules/clean-code.md). Read the relevant PRD, ADR, spec, and test rules when the change touches them.
2. Inspect the target code, its callers, nearby tests, and established patterns. State the acceptance criterion and preserve existing behavior unless the requirement explicitly changes it.
3. Make the smallest complete change in scope. Prefer clear domain names, cohesive functions, explicit types, and simple control flow. Use existing abstractions and conventions; do not add indirection or generalize a one-off need.
4. Keep behavior and errors explicit. Avoid `any`, silent fallbacks, broad catches, duplicated derived state, and comments that merely repeat the code. Add a comment only when it clarifies a non-obvious decision.
5. Add or update tests only as required by the criterion, following [tests](../../docs/rules/tests.md). Do not refactor unrelated code.
6. Run the smallest relevant test and type/build checks specified by [checks](../../docs/rules/checks.md). Review the diff and `git status --short`; report any pre-existing or out-of-scope changes without altering them.

## Project Precedence

The guidance in [clean-code](../../docs/rules/clean-code.md) is a reference, not a hard style mandate. Project conventions, the PRD, ADRs, specs, and repository restrictions take precedence. Do not start implementation without the required approved plan or spec; stop and ask when a project rule requires prior approval.

## 


Report the criterion addressed, the files changed, the checks run and their results, and any remaining blockers. Do not claim completion when a required check fails.