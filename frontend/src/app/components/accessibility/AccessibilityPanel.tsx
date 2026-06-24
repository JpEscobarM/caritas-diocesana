import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Accessibility, Eye, Minus, Plus, RotateCcw, X } from "lucide-react";
import { cn } from "../ui/utils";
import {
  DEFAULT_FONT_SCALE,
  useAccessibilityPreferences,
} from "../../hooks/useAccessibilityPreferences";

const PANEL_ID = "caritas-accessibility-panel";
const PANEL_TITLE_ID = "caritas-accessibility-title";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ActionButtonProps = {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  ariaLabel?: string;
};

function ActionButton({
  title,
  description,
  icon,
  onClick,
  disabled,
  pressed,
  ariaLabel,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? title}
      aria-pressed={pressed}
      className={cn(
        "flex min-h-16 w-full items-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary hover:bg-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
        pressed && "border-primary bg-accent text-accent-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-muted text-foreground"
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block text-base font-bold text-foreground">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

export default function AccessibilityPanel() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const {
    preferences,
    fontScaleLabel,
    canIncreaseFont,
    canDecreaseFont,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleHighContrast,
    toggleReadable,
    resetAll,
  } = useAccessibilityPreferences();

  const openPanel = () => {
    setIsPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    window.requestAnimationFrame(() => {
      triggerButtonRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePanel, isPanelOpen]);

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstFocusableElement) {
      event.preventDefault();
      lastFocusableElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  };

  return (
    <div className="caritas-accessibility-widget">
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={isPanelOpen ? closePanel : openPanel}
        aria-label={
          isPanelOpen
            ? "Fechar painel de acessibilidade"
            : "Abrir painel de acessibilidade"
        }
        aria-controls={PANEL_ID}
        aria-expanded={isPanelOpen}
        className="fixed bottom-24 right-4 z-40 inline-flex min-h-14 items-center gap-3 rounded-full border-2 border-white bg-primary px-4 py-3 text-base font-bold text-primary-foreground shadow-2xl transition-transform hover:scale-[1.03] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-95 md:bottom-5 md:right-5 md:px-5 sm:right-6"
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
        <span className="hidden sm:inline">Acessibilidade</span>
      </button>

      {isPanelOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-[45] bg-black/40 sm:hidden"
            onClick={closePanel}
          />

          <aside
            ref={panelRef}
            id={PANEL_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby={PANEL_TITLE_ID}
            onKeyDown={handlePanelKeyDown}
            className="fixed inset-y-0 right-0 z-[46] flex w-full max-w-sm flex-col border-l-2 border-border bg-card text-card-foreground shadow-2xl"
          >
            <div className="border-b border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Accessibility className="h-6 w-6" aria-hidden="true" />
                  </div>

                  <div>
                    <h2
                      id={PANEL_TITLE_ID}
                      className="text-2xl font-bold text-foreground"
                    >
                      Acessibilidade
                    </h2>
                    <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                      Ajuste a tela para ler e usar o sistema com mais conforto.
                    </p>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closePanel}
                  aria-label="Fechar painel de acessibilidade"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="rounded-2xl border-2 border-border bg-muted/40 p-4">
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Tamanho atual do texto
                </p>
                <p className="mt-1 text-4xl font-bold text-foreground">
                  {fontScaleLabel}
                </p>
                <p aria-live="polite" className="sr-only">
                  Tamanho atual do texto: {fontScaleLabel}.
                </p>
              </div>

              <div
                className="mt-5 flex flex-col gap-3"
                aria-label="Opções de acessibilidade"
              >
                <ActionButton
                  title="Aumentar texto"
                  description="Deixa letras e botões maiores."
                  icon={<Plus className="h-6 w-6" />}
                  onClick={increaseFont}
                  disabled={!canIncreaseFont}
                  ariaLabel="Aumentar tamanho do texto do sistema"
                />

                <ActionButton
                  title="Diminuir texto"
                  description="Reduz o tamanho das letras."
                  icon={<Minus className="h-6 w-6" />}
                  onClick={decreaseFont}
                  disabled={!canDecreaseFont}
                  ariaLabel="Diminuir tamanho do texto do sistema"
                />

                <ActionButton
                  title="Tamanho normal"
                  description="Volta o texto para o tamanho padrão."
                  icon={<RotateCcw className="h-6 w-6" />}
                  onClick={resetFont}
                  disabled={preferences.fontScale === DEFAULT_FONT_SCALE}
                  ariaLabel="Restaurar tamanho padrão do texto"
                />

                <ActionButton
                  title="Alto contraste"
                  description={
                    preferences.highContrast
                      ? "Ligado. Use para destacar texto e botões."
                      : "Aumenta o contraste entre fundo, texto e botões."
                  }
                  icon={<Eye className="h-6 w-6" />}
                  onClick={toggleHighContrast}
                  pressed={preferences.highContrast}
                  ariaLabel="Ativar ou desativar alto contraste"
                />

                <ActionButton
                  title="Leitura mais confortável"
                  description={
                    preferences.readable
                      ? "Ligado. Espaçamento e foco visual melhorados."
                      : "Melhora espaçamento, leitura e visibilidade do foco."
                  }
                  icon={<Accessibility className="h-6 w-6" />}
                  onClick={toggleReadable}
                  pressed={preferences.readable}
                  ariaLabel="Ativar ou desativar modo de leitura mais confortável"
                />
              </div>

              <button
                type="button"
                onClick={resetAll}
                className="mt-5 min-h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base font-bold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring"
              >
                Restaurar todas as opções
              </button>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Essas preferências ficam salvas neste navegador e serão mantidas
                quando você abrir o sistema novamente.
              </p>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
