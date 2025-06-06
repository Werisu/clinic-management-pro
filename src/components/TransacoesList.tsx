
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TransacaoForm } from './TransacaoForm';
import { TransacaoCard } from './TransacaoCard';
import { TransacoesFilters } from './TransacoesFilters';
import { TransacoesEmpty } from './TransacoesEmpty';

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

export function TransacoesList() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
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

  const filteredTransacoes = transacoes.filter(transacao => {
    const matchesSearch = transacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transacao.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || transacao.tipo === filterTipo;
    const matchesStatus = filterStatus === 'todos' || transacao.status === filterStatus;
    
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
        
        <TransacoesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterTipo={filterTipo}
          onTipoChange={setFilterTipo}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
        />
      </CardHeader>
      
      <CardContent>
        {filteredTransacoes.length === 0 ? (
          <TransacoesEmpty />
        ) : (
          <div className="space-y-4">
            {filteredTransacoes.map((transacao) => (
              <TransacaoCard
                key={transacao.id}
                transacao={transacao}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
