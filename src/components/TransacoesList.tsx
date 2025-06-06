
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TransacaoForm } from './TransacaoForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data_transacao: string;
  forma_pagamento: string;
  status: string;
  observacoes?: string;
  created_at: string;
}

export function TransacoesList() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransacoes();
    }
  }, [user]);

  const fetchTransacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .order('data_transacao', { ascending: false });

      if (error) throw error;
      setTransacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchTransacoes();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        const { error } = await supabase
          .from('transacoes_financeiras')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchTransacoes();
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredTransacoes = transacoes.filter(transacao => {
    const matchesSearch = transacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transacao.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === '' || transacao.tipo === filterTipo;
    const matchesStatus = filterStatus === '' || transacao.status === filterStatus;
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vet-primary"></div>
      </div>
    );
  }

  return (
    <Card className="vet-card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-vet-primary" />
            Transações Financeiras
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="vet-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <TransacaoForm 
              onSuccess={handleSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </Dialog>
        </CardTitle>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Input
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransacoes.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma transação encontrada</h3>
            <p className="text-muted-foreground">Adicione uma nova transação para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransacoes.map((transacao) => (
              <div
                key={transacao.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
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
                        onClick={() => handleDelete(transacao.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
