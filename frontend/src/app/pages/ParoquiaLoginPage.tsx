import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getParoquias, loginParoquia } from "../api/auth";
import { Parish } from "../types/types";

export default function ParoquiaLoginPage() {
  const [listaParoquias, setListaParoquias] = useState<Parish[]>([]);
  const [erro, setErro] = useState("");
  const [paroquiaSelecionada, setParoquiaSelecionada] = useState<number>(0);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  //useEffect É UM RECURSO DO REACT PARA EXECUTAR UMA FUNCAO QUANDO O COMPONENTE É CARREGADO
  useEffect(() => {
    const carregarParoquias = async () => {
      try {
        const listaParoquias = await getParoquias();

        setListaParoquias(listaParoquias);
      } catch (error: any) {
        setErro(error?.response?.data?.message || "Erro ao buscar paroquias");
      }
    };

    carregarParoquias();
  }, []);

  const navigate = useNavigate();

  //TypeScript reclama de parametro sem tipo, por isso o React.SyntheticEvent<HTMLFormElement>
  const handleLoginSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setLoading(true);

    //FAZER AUTENTICACAO AQUI
    const emailLimpo = email.trim();
    const senhaLimpa = senha.trim();

    try {
      const response = await loginParoquia(
        emailLimpo,
        senhaLimpa,
        paroquiaSelecionada,
      );

      console.log(response);
    } catch (error: any) {
      setErro(error?.response?.data?.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }

    //LOGIN SENDO REALIZADO, GUARDAR SESSAO E VERIFICAR SESSAO EM PAROQUIAPAGE.
    //navigate("/paroquia");
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
              Cáritas Paroquial
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
                Paróquia
              </label>

              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-200"
                value={paroquiaSelecionada}
                onChange={(e) => setParoquiaSelecionada(Number(e.target.value))}
              >
                <option value="0">Selecione sua paróquia</option>
                {listaParoquias.map((paroquia) => (
                  <option key={paroquia.id} value={paroquia.id}>
                    {paroquia.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--primary)]">
                Usuário
              </label>
              <input
                type="email"
                placeholder="Digite seu usuário"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--primary)]">
                Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-200"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-lg font-medium text-white shadow-md transition duration-150 hover:opacity-95 hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              className="text-sm text-[var(--light-text)] transition hover:text-[var(--primary)]"
            >
              Esqueceu sua senha?
            </button>
          </form>
        </div>

        <p className="text-sm text-[var(--light-text)]">
          Sistema de Gestão Integrada - Cáritas Diocesana
        </p>
      </div>
    </div>
  );
}
