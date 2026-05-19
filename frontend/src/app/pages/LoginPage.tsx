import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Building2, Church } from "lucide-react";
import { authenticate } from "../lib/auth"; //arquivo .tsx responsavel pela autenticacao
import type { Profile } from "../types/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] shadow-lg">
            <Heart className="h-8 w-8 fill-white text-white" />
          </div>

          <h1 className="text-4xl font-medium text-[var(--primary)]">
            Sistema Cáritas
          </h1>

          <h3 className="text-lg font-light text-[var(--light-text)]">
            Gestão integrada de Assistência Social
          </h3>
        </div>

        <div className="w-full rounded-2xl border border-slate-200 bg-[var(--card)] p-8 shadow-xl">
          <h2 className="mb-8 text-center text-2xl font-medium text-[var(--primary)]">
            Selecione seu perfil de acesso
          </h2>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/login/diocese")}
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-left transition hover:border-[var(--primary)] hover:bg-slate-50 transition duration-150 active:scale-95"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-[var(--primary)]">
                <Building2 className="h-7 w-7 text-[var(--primary)] transition group-hover:text-white" />
              </div>

              <div>
                <span className="block text-xl font-medium text-[var(--primary)]">
                  Cáritas Diocesana
                </span>
                <span className="block text-sm text-[var(--light-text)]">
                  Acesso administrativo diocesano
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate("/login/paroquia")}
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-left transition hover:border-[var(--primary)] hover:bg-slate-50 transition duration-150 active:scale-95"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-[var(--primary)]">
                <Church className="h-7 w-7 text-[var(--primary)] transition group-hover:text-white" />
              </div>

              <div>
                <span className="block text-xl font-medium text-[var(--primary)]">
                  Cáritas Paroquial
                </span>
                <span className="block text-sm text-[var(--light-text)]">
                  Acesso paroquial
                </span>
              </div>
            </button>
          </div>
        </div>

        <p className="text-sm text-[var(--light-text)]">
          Sistema de Gestão Integrada - Cáritas Diocesana
        </p>
      </div>
    </div>
  );
}
