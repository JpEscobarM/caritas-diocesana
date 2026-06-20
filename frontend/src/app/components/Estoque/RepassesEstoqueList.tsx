import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  CalendarDays,
  Eye,
  Package,
  Plus,
  Search,
} from "lucide-react";

import type { ParishInventoryRepasse } from "../../types/EstoqueTypes";
import type { Parish } from "../../types/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

export interface RepassesEstoqueListProps {
  repasses: ParishInventoryRepasse[];
  parishes?: Parish[];
  onCreate?: () => void;
  onViewDetails?: (repasse: ParishInventoryRepasse) => void;
  actionsDisabled?: boolean;
}

function formatDateTime(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export default function RepassesEstoqueList({
  repasses,
  parishes = [],
  onCreate,
  onViewDetails,
  actionsDisabled = false,
}: RepassesEstoqueListProps) {
  const [search, setSearch] = useState("");

  const parishNames = useMemo(
    () => new Map(parishes.map((parish) => [parish.id, parish.name] as const)),
    [parishes],
  );

  const filteredRepasses = useMemo(() => {
    const normalized = normalizeSearch(search);

    return [...repasses]
      .filter((repasse) => {
        if (!normalized) {
          return true;
        }

        return [
          repasse.id.toString(),
          parishNames.get(repasse.parish_id) ?? `Paróquia #${repasse.parish_id}`,
          repasse.notes ?? "",
          ...repasse.items.map((item) =>
            [item.name, item.description ?? "", item.unit ?? ""].join(" "),
          ),
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);
      })
      .sort(
        (first, second) =>
          new Date(second.delivered_at).getTime() -
          new Date(first.delivered_at).getTime(),
      );
  }, [parishNames, repasses, search]);

  return (
    <Card className="min-h-0">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Repasses de estoque</CardTitle>
            <CardDescription>
              Consulte os repasses recebidos pelas paróquias. A diocese registra
              novos repasses e os itens entram direto no estoque paroquial.
            </CardDescription>
          </div>

          {onCreate && (
            <Button
              type="button"
              onClick={onCreate}
              disabled={actionsDisabled}
            >
              <Plus aria-hidden="true" />
              Novo repasse
            </Button>
          )}
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar paróquia, item ou observação"
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="min-h-0">
        {repasses.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <ArrowRightLeft
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-foreground">
                Nenhum repasse registrado
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Quando a diocese registrar um repasse, ele aparecerá aqui para
                acompanhamento.
              </p>
            </div>
            {onCreate && (
              <Button
                type="button"
                onClick={onCreate}
                disabled={actionsDisabled}
              >
                <Plus aria-hidden="true" />
                Registrar primeiro repasse
              </Button>
            )}
          </div>
        ) : filteredRepasses.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Search className="size-9 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">
                Nenhum repasse encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                Altere a busca para visualizar outros repasses.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => setSearch("")}>
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-24rem)] space-y-3 overflow-y-auto pr-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{filteredRepasses.length} repasse(s) encontrado(s)</span>
              <Badge variant="secondary">Total: {repasses.length}</Badge>
            </div>

            {filteredRepasses.map((repasse) => {
              const totalUnits = repasse.items.reduce(
                (total, item) => total + item.quantity,
                0,
              );
              const parishName =
                parishNames.get(repasse.parish_id) ??
                `Paróquia #${repasse.parish_id}`;

              return (
                <article
                  key={repasse.id}
                  className="rounded-xl border p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">
                          {parishName}
                        </h3>
                        <Badge variant="outline">Repasse #{repasse.id}</Badge>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-4" aria-hidden="true" />
                          {formatDateTime(repasse.delivered_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Package className="size-4" aria-hidden="true" />
                          {repasse.items.length} item(ns), {totalUnits} unidade(s)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="size-4" aria-hidden="true" />
                          Paróquia #{repasse.parish_id}
                        </span>
                      </div>

                      {repasse.notes && (
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                          {repasse.notes}
                        </p>
                      )}
                    </div>

                    {onViewDetails && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onViewDetails(repasse)}
                      >
                        <Eye aria-hidden="true" />
                        Ver detalhes
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
