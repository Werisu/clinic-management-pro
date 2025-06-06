
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MovimentacaoForm } from './MovimentacaoForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Movimentacao {
  id: string;
  produto_id: string;
  produtos_estoque: {
    nome: string;
    unidade_medida: string;
  };
  tipo: string;
  quantidade: number;
  quantidade_anterior: number;
  quantidade_nova: number;
  motivo?: string;
  observacoes?: string;
  created_at: string;
}

export function MovimentacoesList() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMovimentacoes();
    }
  }, [user]);

  const fetchMovimentacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('movimentacoes_estoque')
        .select(`
          *,
          produtos_estoque (
            nome,
            unidade_medida
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovimentacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchMovimentacoes();
  };

  const getMovimentacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'saida':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ajuste':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getMovimentacaoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-100 text-green-800';
      case 'saida':
        return 'bg-red-100 text-red-800';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMovimentacoes = movimentacoes.filter(mov => {
    const matchesSearch = mov.produtos_estoque?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mov.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || mov.tipo === filterTipo;
    
    return matchesSearch && matchesTipo;
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
            <RotateCcw className="h-5 w-5 text-vet-primary" />
            Movimentações de Estoque
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="vet-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <MovimentacaoForm 
              onSuccess={handleSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </Dialog>
        </CardTitle>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Input
            placeholder="Buscar por produto ou motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
              <SelectItem value="ajuste">Ajuste</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredMovimentacoes.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma movimentação encontrada</h3>
            <p className="text-muted-foreground">Registre uma nova movimentação para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMovimentacoes.map((mov) => (
              <div
                key={mov.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getMovimentacaoIcon(mov.tipo)}
                      <h3 className="font-semibold text-lg">{mov.produtos_estoque?.nome}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovimentacaoColor(mov.tipo)}`}>
                        {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>
                        <strong>Quantidade:</strong> {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade} {mov.produtos_estoque?.unidade_medida}
                      </div>
                      <div>
                        <strong>Anterior:</strong> {mov.quantidade_anterior} {mov.produtos_estoque?.unidade_medida}
                      </div>
                      <div>
                        <strong>Nova:</strong> {mov.quantidade_nova} {mov.produtos_estoque?.unidade_medida}
                      </div>
                      <div>
                        <strong>Data:</strong> {format(new Date(mov.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    </div>
                    
                    {mov.motivo && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Motivo:</strong> {mov.motivo}
                      </p>
                    )}
                    
                    {mov.observacoes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Observações:</strong> {mov.observacoes}
                      </p>
                    )}
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
