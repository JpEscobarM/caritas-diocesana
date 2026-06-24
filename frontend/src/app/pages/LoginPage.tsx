import { Building2, Church, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background px-3 py-5 text-foreground sm:px-5 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl flex-col items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <section
          aria-labelledby="login-title"
          className="w-full overflow-hidden rounded-3xl border border-border bg-card caritas-card-shadow"
        >
          <div className="bg-primary px-4 py-4 text-primary-foreground sm:px-6 sm:py-5">
            <div className="mx-auto flex max-w-3xl items-center justify-center rounded-2xl bg-white px-4 py-3 sm:px-6 sm:py-4">
              <BrandLogo variant="horizontal" className="h-16 w-auto max-w-full sm:h-20" />
            </div>
          </div>

          <div className="px-4 py-6 sm:px-10 sm:py-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 id="login-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                Sistema Cáritas
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Escolha o tipo de acesso para entrar no sistema. Use a opção que corresponde à sua equipe.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/login/diocese")}
                className="group flex min-h-36 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border bg-card p-5 text-center sm:min-h-40 sm:p-7 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
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
                className="group flex min-h-36 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border bg-card p-5 text-center sm:min-h-40 sm:p-7 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
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
