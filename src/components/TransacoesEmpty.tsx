
import { DollarSign } from "lucide-react";

export function TransacoesEmpty() {
  return (
    <div className="text-center py-8">
      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold">Nenhuma transação encontrada</h3>
      <p className="text-muted-foreground">Adicione uma nova transação para começar.</p>
    </div>
  );
}
