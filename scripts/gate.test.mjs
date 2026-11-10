import { test } from "node:test";
import assert from "node:assert/strict";
import { validarFechamento } from "./gate.mjs";
test("test_ca_003_09_gate_recusa_ausente_desatualizado_sem_teste_e_pendente", () => {
  const checks = { aprovado: true, estado: "atual" };
  const r = {
    spec: "003",
    estado: "atual",
    conclusao: "PRONTA",
    criterios: [
      {
        ca: "CA-01",
        resultado: "APROVADO",
        evidencia: "test.ts:1; comando passou",
        motivo: "regra exercitada",
      },
    ],
  };
  const validar = (rel) =>
    validarFechamento(rel, checks, "atual", "003", ["CA-01"]);
  assert.equal(validar(r), true);
  assert.throws(() => validar(null), /ausente/);
  assert.throws(() => validar({ ...r, estado: "antigo" }), /desatualizado/);
  assert.throws(() => validar({ ...r, criterios: [] }), /incompleta/);
  for (const resultado of ["SEM_TESTE", "PENDENTE", "FALHOU"])
    assert.throws(
      () => validar({ ...r, criterios: [{ ...r.criterios[0], resultado }] }),
      /não pronta/,
    );
  assert.throws(
    () =>
      validarFechamento(r, { ...checks, aprovado: false }, "atual", "003", [
        "CA-01",
      ]),
    /Checks/,
  );
});
