
import { Button } from "@/components/ui/button";
import { Edit, Trash, TrendingUp, TrendingDown } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transacao {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  data_transacao: string;
  forma_pagamento: string;
  status: string;
  observacoes?: string;
  created_at: string;
}

interface TransacaoCardProps {
  transacao: Transacao;
  onDelete: (id: string) => void;
}

export function TransacaoCard({ transacao, onDelete }: TransacaoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {transacao.tipo === 'receita' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <h3 className="font-semibold text-lg">{transacao.descricao}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              transacao.tipo === 'receita' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
            <div>
              <strong>Categoria:</strong> {transacao.categoria}
            </div>
            <div>
              <strong>Data:</strong> {format(new Date(transacao.data_transacao), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div>
              <strong>Pagamento:</strong> {transacao.forma_pagamento?.replace('_', ' ')}
            </div>
            <div>
              <strong>Status:</strong> 
              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                transacao.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                transacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {transacao.status}
              </span>
            </div>
          </div>
          
          {transacao.observacoes && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Observações:</strong> {transacao.observacoes}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`text-xl font-bold ${
            transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(transacao.valor)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(transacao.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
