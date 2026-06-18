import {
  AlertTriangle,
  Boxes,
  Gift,
  PackageCheck,
  PackageX,
  Warehouse,
} from "lucide-react";

import { Card, CardContent } from "../ui/card";

export interface EstoqueResumoProps {
  inventoriesCount: number;
  itemsCount: number;
  totalQuantity: number;
  expiringQuantity: number;
  expiredQuantity: number;
  deliveriesCount: number;
}

export default function EstoqueResumo({
  inventoriesCount,
  itemsCount,
  totalQuantity,
  expiringQuantity,
  expiredQuantity,
  deliveriesCount,
}: EstoqueResumoProps) {
  const cards = [
    {
      label: "Inventários",
      value: inventoriesCount,
      helper: `${itemsCount} item(ns) cadastrado(s)`,
      icon: Warehouse,
    },
    {
      label: "Quantidade em estoque",
      value: totalQuantity,
      helper: "Soma dos totais dos itens",
      icon: Boxes,
    },
    {
      label: "Vencendo em 7 dias",
      value: expiringQuantity,
      helper: "Quantidade em lotes próximos do vencimento",
      icon: AlertTriangle,
    },
    {
      label: "Itens vencidos",
      value: expiredQuantity,
      helper: "Quantidade em lotes expirados",
      icon: PackageX,
    },
    {
      label: "Entregas registradas",
      value: deliveriesCount,
      helper: "Saídas realizadas para famílias",
      icon: Gift,
    },
    {
      label: "Fluxo de saída",
      value: "Entrega",
      helper: "Única forma de saída implementada",
      icon: PackageCheck,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {card.helper}
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
