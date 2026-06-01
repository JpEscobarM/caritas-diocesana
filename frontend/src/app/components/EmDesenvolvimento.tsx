import { Package } from "lucide-react";

interface EmDesenvolvimentoProps {
  title?: string;
  description?: string;
}

export default function EmDesenvolvimento({
  title = "Em desenvolvimento",
  description = "Esta seção será implementada em breve.",
}: EmDesenvolvimentoProps) {
  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl text-foreground font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </>
  );
}
