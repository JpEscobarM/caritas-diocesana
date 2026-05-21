import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getParoquias } from "../api/auth";
import { Parish } from "../types/types";

export default function ParoquiaLoginPage() {
  const [listaParoquias, setListaParoquias] = useState<Parish[]>([]);
  const [erro, setErro] = useState("");

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

  const handleLoginSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    //TypeScript reclama de parametro sem tipo, por isso o React.SyntheticEvent<HTMLFormElement>
    event.preventDefault();

    //FAZER AUTENTICACAO AQUI

    navigate("/paroquia");
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--primary)]">
                Paróquia
              </label>

              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-200">
                <option value="">Selecione sua paróquia</option>
                {listaParoquias.map((paroquia, index) => (
                  <option key={index} value={paroquia.slug}>
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
                type="text"
                placeholder="Digite seu usuário"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[var(--primary)] outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-lg font-medium text-white shadow-md transition duration-150 hover:opacity-95 hover:shadow-lg active:scale-[0.98]"
            >
              Entrar
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
