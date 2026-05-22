import BrandLogo from "../components/BrandLogo";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Church } from "lucide-react";
import { getParoquias, loginParoquia, setAuthSession } from "../api/auth";
import type { AuthSession, Parish } from "../types/types";

export default function ParoquiaLoginPage() {
  const [listaParoquias, setListaParoquias] = useState<Parish[]>([]);
  const [erro, setErro] = useState("");
  const [paroquiaSelecionada, setParoquiaSelecionada] = useState<number>(0);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingParoquias, setLoadingParoquias] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const carregarParoquias = async () => {
      setLoadingParoquias(true);
      try {
        const listaParoquias = await getParoquias();
        setListaParoquias(listaParoquias);
      } catch (error: any) {
        setErro(
          error?.response?.data?.message ||
            "Não foi possível carregar as paróquias. Tente atualizar a página.",
        );
      } finally {
        setLoadingParoquias(false);
      }
    };

    carregarParoquias();
  }, []);

  const handleLoginSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErro("");

    if (!paroquiaSelecionada) {
      setErro("Selecione a sua paróquia antes de entrar.");
      return;
    }

    setLoading(true);

    const emailLimpo = email.trim();
    const senhaLimpa = senha.trim();

    try {
      const response = await loginParoquia(
        emailLimpo,
        senhaLimpa,
        paroquiaSelecionada,
      );

      const session: AuthSession = {
        token_type: response.token_type,
        access_token: response.access_token,
        abilities: response.abilities,
        user: response.user,
        parish: response.parish,
      };

      setAuthSession(session);
      navigate("/paroquia");
    } catch (error: any) {
      setErro(
        error?.response?.data?.message ||
          "Não foi possível entrar. Confira a paróquia, o email, a senha e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-border">
            <BrandLogo
              variant="vertical"
              alt="Cáritas Brasileira"
              className="h-32 w-auto"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Sistema Cáritas
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Gestão integrada de assistência social
            </p>
          </div>
        </div>

        <section
          aria-labelledby="paroquia-login-title"
          className="w-full rounded-3xl border border-border bg-card p-6 caritas-card-shadow sm:p-8"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Church className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 id="paroquia-login-title" className="text-2xl font-bold text-foreground">
                  Acesso da Paróquia
                </h2>
                <p className="mt-1 text-base text-muted-foreground">
                  Selecione sua paróquia e entre com seus dados.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Voltar
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5" noValidate>
            {erro && (
              <div
                id="login-error"
                role="alert"
                aria-live="assertive"
                className="caritas-error-message flex items-start gap-3 rounded-xl px-4 py-3 text-base"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{erro}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="paroquia" className="text-base font-semibold text-foreground">
                Paróquia
              </label>
              <select
                id="paroquia"
                name="paroquia"
                required
                className="min-h-12 w-full rounded-lg border-2 border-input bg-input-background px-4 py-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-80"
                value={paroquiaSelecionada}
                onChange={(e) => setParoquiaSelecionada(Number(e.target.value))}
                disabled={loadingParoquias}
                aria-describedby="paroquia-ajuda"
                aria-invalid={Boolean(erro) && !paroquiaSelecionada}
              >
                <option value="0">
                  {loadingParoquias ? "Carregando paróquias..." : "Selecione sua paróquia"}
                </option>
                {listaParoquias.map((paroquia) => (
                  <option key={paroquia.id} value={paroquia.id}>
                    {paroquia.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-base font-semibold text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="exemplo@caritas.org.br"
                className="min-h-12 w-full rounded-lg border-2 border-input bg-input-background px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? "login-error" : undefined}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="senha" className="text-base font-semibold text-foreground">
                Senha
              </label>
              <input
                id="senha"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Digite sua senha"
                className="min-h-12 w-full rounded-lg border-2 border-input bg-input-background px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || loadingParoquias}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground shadow-sm transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Entrando..." : "Entrar no sistema"}
            </button>

            <p className="text-center text-base text-muted-foreground">
              Esqueceu a senha? Procure a pessoa responsável pelo sistema na sua paróquia.
            </p>
          </form>
        </section>

        <p className="text-center text-base text-muted-foreground">
          Sistema de Gestão Integrada - Cáritas Diocesana
        </p>
      </div>
    </main>
  );
}
