import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { App } from "./App";
import { useAuth } from "./stores/auth";

describe("test_ca_01_fundacao", () => {
  beforeEach(() => {
    useAuth.setState({ usuario: null, erro: null });
  });

  it("test_ca_01_login_renderiza_sem_sessao", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });
});
