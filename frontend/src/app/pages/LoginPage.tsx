import { Building2, Church, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center">
        <section
          aria-labelledby="login-title"
          className="w-full overflow-hidden rounded-3xl border border-border bg-card caritas-card-shadow"
        >
          <div className="bg-primary px-6 py-5 text-primary-foreground">
            <div className="mx-auto flex max-w-3xl items-center justify-center rounded-2xl bg-white px-6 py-4">
              <BrandLogo variant="horizontal" className="h-20 w-auto max-w-full" />
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 id="login-title" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Sistema Cáritas
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Escolha o tipo de acesso para entrar no sistema. Use a opção que corresponde à sua equipe.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/login/diocese")}
                className="group flex min-h-40 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border bg-card p-7 text-center transition-colors hover:border-primary hover:bg-accent focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Building2 className="h-8 w-8" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold text-foreground">Cáritas Diocesana</span>
                <span className="text-base text-muted-foreground">
                  Acesso da equipe da Cáritas Diocesana.
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/login/paroquia")}
                className="group flex min-h-40 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border bg-card p-7 text-center transition-colors hover:border-primary hover:bg-accent focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Church className="h-8 w-8" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold text-foreground">Cáritas Paroquial</span>
                <span className="text-base text-muted-foreground">
                  Acesso da equipe das paróquias.
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
