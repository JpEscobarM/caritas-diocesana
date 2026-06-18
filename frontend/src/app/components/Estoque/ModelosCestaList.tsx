import { ClipboardList, Package } from "lucide-react";

import type { BasketTemplate } from "../../types/EstoqueTypes";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface ModelosCestaListProps {
  templates: BasketTemplate[];
}

export default function ModelosCestaList({ templates }: ModelosCestaListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Modelos de cesta</CardTitle>
            <CardDescription>
              Composições predefinidas utilizadas no registro das entregas.
            </CardDescription>
          </div>
          <Badge variant="secondary">{templates.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <ClipboardList className="size-9 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Nenhum modelo cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Os modelos de cesta desta paróquia aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {templates.map((template) => (
              <article key={template.id} className="rounded-xl border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {template.description || "Sem descrição"}
                    </p>
                  </div>
                  <Badge variant={template.active ? "default" : "secondary"}>
                    {template.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  {template.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2 font-medium text-foreground">
                        <Package className="size-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {item.quantity} por cesta
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
