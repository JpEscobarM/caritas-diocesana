import{Package}  from "lucide-react";

export default function EmDesenvolvimento(){

    return(
        <>
        <div className="max-w-6xl mx-auto">
                <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
                  <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl text-foreground font-medium mb-2">Em desenvolvimento</h3>
                  <p className="text-muted-foreground">Esta seção será implementada em breve.</p>
                </div>
              </div>
        </>
    );
}