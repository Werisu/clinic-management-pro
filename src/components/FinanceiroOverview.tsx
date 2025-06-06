
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialSummary {
  receitasMes: number;
  despesasMes: number;
  lucroMes: number;
  receitasUltimoMes: number;
  despesasUltimoMes: number;
}

export function FinanceiroOverview() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFinancialSummary();
    }
  }, [user]);

  const fetchFinancialSummary = async () => {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Buscar transações do mês atual
      const { data: currentMonth } = await supabase
        .from('transacoes_financeiras')
        .select('tipo, valor')
        .gte('data_transacao', format(currentMonthStart, 'yyyy-MM-dd'))
        .lte('data_transacao', format(currentMonthEnd, 'yyyy-MM-dd'))
        .eq('status', 'confirmado');

      // Buscar transações do mês passado
      const { data: lastMonth } = await supabase
        .from('transacoes_financeiras')
        .select('tipo, valor')
        .gte('data_transacao', format(lastMonthStart, 'yyyy-MM-dd'))
        .lte('data_transacao', format(lastMonthEnd, 'yyyy-MM-dd'))
        .eq('status', 'confirmado');

      const receitasMes = currentMonth?.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      const despesasMes = currentMonth?.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      const receitasUltimoMes = lastMonth?.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      const despesasUltimoMes = lastMonth?.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Number(t.valor), 0) || 0;

      setSummary({
        receitasMes,
        despesasMes,
        lucroMes: receitasMes - despesasMes,
        receitasUltimoMes,
        despesasUltimoMes
      });
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
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

  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vet-primary"></div>
      </div>
    );
  }

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="vet-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas - {currentMonth}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.receitasMes || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.receitasUltimoMes > 0 && (
                <>
                  {calculatePercentChange(summary.receitasMes, summary.receitasUltimoMes) > 0 ? '+' : ''}
                  {calculatePercentChange(summary.receitasMes, summary.receitasUltimoMes).toFixed(1)}% em relação ao mês anterior
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="vet-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas - {currentMonth}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary?.despesasMes || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.despesasUltimoMes > 0 && (
                <>
                  {calculatePercentChange(summary.despesasMes, summary.despesasUltimoMes) > 0 ? '+' : ''}
                  {calculatePercentChange(summary.despesasMes, summary.despesasUltimoMes).toFixed(1)}% em relação ao mês anterior
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="vet-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido - {currentMonth}</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.lucroMes || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary?.lucroMes || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas menos despesas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-vet-primary" />
            Resumo Financeiro por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Gráficos e relatórios detalhados serão implementados em breve
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
