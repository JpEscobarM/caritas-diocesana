import { useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginDiocese, setAuthSession } from "../api/auth";
import { AuthSession } from "../types/types";

export default function DioceseLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const emailLimpo = email.trim();
      const passwordLimpo = senha.trim();
      const response = await loginDiocese(emailLimpo, passwordLimpo);

      const session: AuthSession = {
        token_type: response.token_type,
        access_token: response.access_token,
        abilities: response.abilities,
        user: response.user,
        parish: response.parish,
      };

      setAuthSession(session); //SESSAO SENDO GUARDADA NO LOCALSTORAGE

      navigate("/diocese");
    } catch (error: any) {
      setErro(error?.response?.data?.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

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
            Gestão Integrada de Assistência Social
          </h3>
        </div>

        <div className="w-full rounded-2xl border border-slate-200 bg-[var(--card)] p-8 shadow-xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-medium text-[var(--primary)]">
              Cáritas Diocesana
            </h2>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-[var(--light-text)] transition hover:text-[var(--primary)]"
            >
              Voltar
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            {erro && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {erro}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--primary)]">
                Email
              </label>
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--primary)]">
                Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-lg font-medium text-white shadow-md transition duration-150 hover:opacity-95 hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
