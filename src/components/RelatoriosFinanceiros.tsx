
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Download, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RelatorioData {
  receitas: number;
  despesas: number;
  lucro: number;
  transacoesPorCategoria: Array<{ name: string; value: number; color: string }>;
  movimentacaoMensal: Array<{ mes: string; receitas: number; despesas: number }>;
}

export function RelatoriosFinanceiros() {
  const [data, setData] = useState<RelatorioData>({
    receitas: 0,
    despesas: 0,
    lucro: 0,
    transacoesPorCategoria: [],
    movimentacaoMensal: []
  });
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState('mes-atual');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      gerarRelatorio();
    }
  }, [user, periodo, dataInicio, dataFim]);

  const getDateRange = () => {
    const now = new Date();
    
    switch (periodo) {
      case 'mes-atual':
        return {
          inicio: startOfMonth(now),
          fim: endOfMonth(now)
        };
      case 'ano-atual':
        return {
          inicio: startOfYear(now),
          fim: endOfYear(now)
        };
      case 'personalizado':
        return {
          inicio: dataInicio ? new Date(dataInicio) : startOfMonth(now),
          fim: dataFim ? new Date(dataFim) : endOfMonth(now)
        };
      default:
        return {
          inicio: startOfMonth(now),
          fim: endOfMonth(now)
        };
    }
  };

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      const { inicio, fim } = getDateRange();
      
      const { data: transacoes, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .gte('data_transacao', format(inicio, 'yyyy-MM-dd'))
        .lte('data_transacao', format(fim, 'yyyy-MM-dd'))
        .eq('status', 'confirmado');

      if (error) throw error;

      const receitas = transacoes
        ?.filter(t => t.tipo === 'receita')
        .reduce((total, t) => total + t.valor, 0) || 0;

      const despesas = transacoes
        ?.filter(t => t.tipo === 'despesa')
        .reduce((total, t) => total + t.valor, 0) || 0;

      // Agrupar por categoria
      const categorias = transacoes?.reduce((acc, t) => {
        if (!acc[t.categoria]) {
          acc[t.categoria] = { receitas: 0, despesas: 0 };
        }
        if (t.tipo === 'receita') {
          acc[t.categoria].receitas += t.valor;
        } else {
          acc[t.categoria].despesas += t.valor;
        }
        return acc;
      }, {} as Record<string, { receitas: number; despesas: number }>) || {};

      const transacoesPorCategoria = Object.entries(categorias).map(([name, values], index) => ({
        name,
        value: values.receitas + values.despesas,
        color: `hsl(${(index * 45) % 360}, 70%, 60%)`
      }));

      // Movimentação mensal (últimos 6 meses para gráfico de barras)
      const movimentacaoMensal = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const inicioMes = startOfMonth(date);
        const fimMes = endOfMonth(date);
        
        const transacoesMes = transacoes?.filter(t => {
          const dataTransacao = new Date(t.data_transacao);
          return dataTransacao >= inicioMes && dataTransacao <= fimMes;
        }) || [];

        const receitasMes = transacoesMes
          .filter(t => t.tipo === 'receita')
          .reduce((total, t) => total + t.valor, 0);

        const despesasMes = transacoesMes
          .filter(t => t.tipo === 'despesa')
          .reduce((total, t) => total + t.valor, 0);

        movimentacaoMensal.push({
          mes: format(date, 'MMM', { locale: ptBR }),
          receitas: receitasMes,
          despesas: despesasMes
        });
      }

      setData({
        receitas,
        despesas,
        lucro: receitas - despesas,
        transacoesPorCategoria,
        movimentacaoMensal
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    // Implementação básica - em produção usaria uma biblioteca como jsPDF
    const conteudo = `
Relatório Financeiro
Data: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}

Resumo do Período:
Receitas: R$ ${data.receitas.toFixed(2)}
Despesas: R$ ${data.despesas.toFixed(2)}
Lucro/Prejuízo: R$ ${data.lucro.toFixed(2)}
    `;
    
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-financeiro.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-vet-primary" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-atual">Mês Atual</SelectItem>
                  <SelectItem value="ano-atual">Ano Atual</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodo === 'personalizado' && (
              <>
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex items-end">
              <Button onClick={gerarRelatorio} disabled={loading} className="vet-gradient text-white">
                {loading ? 'Gerando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="vet-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(data.receitas)}</div>
          </CardContent>
        </Card>

        <Card className="vet-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(data.despesas)}</div>
          </CardContent>
        </Card>

        <Card className="vet-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro/Prejuízo</CardTitle>
            <DollarSign className={`h-4 w-4 ${data.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.lucro)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="vet-card-shadow">
          <CardHeader>
            <CardTitle>Movimentação Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.movimentacaoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="vet-card-shadow">
          <CardHeader>
            <CardTitle>Transações por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.transacoesPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.transacoesPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle>Exportar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={exportarPDF} className="vet-gradient text-white">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
