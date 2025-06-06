
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EstoqueStats {
  totalProdutos: number;
  produtosEstoqueBaixo: number;
  produtosVencendo: number;
  valorTotalEstoque: number;
}

export function EstoqueOverview() {
  const [stats, setStats] = useState<EstoqueStats>({
    totalProdutos: 0,
    produtosEstoqueBaixo: 0,
    produtosVencendo: 0,
    valorTotalEstoque: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEstoqueStats();
    }
  }, [user]);

  const fetchEstoqueStats = async () => {
    try {
      const { data: produtos, error } = await supabase
        .from('produtos_estoque')
        .select('*')
        .eq('ativo', true);

      if (error) throw error;

      const now = new Date();
      const trintaDiasFrente = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const totalProdutos = produtos?.length || 0;
      
      const produtosEstoqueBaixo = produtos?.filter(
        produto => produto.quantidade_atual <= produto.quantidade_minima
      ).length || 0;

      const produtosVencendo = produtos?.filter(produto => {
        if (!produto.data_validade) return false;
        const dataValidade = new Date(produto.data_validade);
        return dataValidade <= trintaDiasFrente;
      }).length || 0;

      const valorTotalEstoque = produtos?.reduce((total, produto) => {
        return total + (produto.quantidade_atual * (produto.preco_custo || 0));
      }, 0) || 0;

      setStats({
        totalProdutos,
        produtosEstoqueBaixo,
        produtosVencendo,
        valorTotalEstoque
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do estoque:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vet-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="vet-card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProdutos}</div>
          <p className="text-xs text-muted-foreground">
            Produtos ativos no estoque
          </p>
        </CardContent>
      </Card>

      <Card className="vet-card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.produtosEstoqueBaixo}</div>
          <p className="text-xs text-muted-foreground">
            Produtos abaixo do mínimo
          </p>
        </CardContent>
      </Card>

      <Card className="vet-card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.produtosVencendo}</div>
          <p className="text-xs text-muted-foreground">
            Vencem em 30 dias
          </p>
        </CardContent>
      </Card>

      <Card className="vet-card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.valorTotalEstoque)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor do estoque atual
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
