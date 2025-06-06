
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, Download } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EstoqueRelatorio {
  produtosEstoqueBaixo: Array<{ nome: string; quantidade_atual: number; quantidade_minima: number }>;
  produtosVencendo: Array<{ nome: string; data_validade: string; dias_para_vencer: number }>;
  movimentacoesPorProduto: Array<{ nome: string; entradas: number; saidas: number }>;
}

export function RelatoriosEstoque() {
  const [data, setData] = useState<EstoqueRelatorio>({
    produtosEstoqueBaixo: [],
    produtosVencendo: [],
    movimentacoesPorProduto: []
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      gerarRelatorio();
    }
  }, [user]);

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      // Produtos com estoque baixo
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos_estoque')
        .select('nome, quantidade_atual, quantidade_minima, data_validade')
        .eq('ativo', true);

      if (produtosError) throw produtosError;

      const produtosEstoqueBaixo = produtos?.filter(
        p => p.quantidade_atual <= p.quantidade_minima
      ) || [];

      // Produtos vencendo (30 dias)
      const now = new Date();
      const trintaDias = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const produtosVencendo = produtos?.filter(p => {
        if (!p.data_validade) return false;
        const dataValidade = new Date(p.data_validade);
        return dataValidade <= trintaDias;
      }).map(p => ({
        ...p,
        dias_para_vencer: Math.ceil((new Date(p.data_validade!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      })) || [];

      // Movimentações por produto (últimos 30 dias)
      const trintaDiasAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const { data: movimentacoes, error: movError } = await supabase
        .from('movimentacoes_estoque')
        .select(`
          tipo,
          quantidade,
          produtos_estoque (nome)
        `)
        .gte('created_at', trintaDiasAtras.toISOString());

      if (movError) throw movError;

      const movimentacoesPorProduto = movimentacoes?.reduce((acc, mov) => {
        const nome = mov.produtos_estoque?.nome || 'Produto Desconhecido';
        if (!acc[nome]) {
          acc[nome] = { nome, entradas: 0, saidas: 0 };
        }
        
        if (mov.tipo === 'entrada') {
          acc[nome].entradas += mov.quantidade;
        } else if (mov.tipo === 'saida') {
          acc[nome].saidas += mov.quantidade;
        }
        
        return acc;
      }, {} as Record<string, { nome: string; entradas: number; saidas: number }>) || {};

      setData({
        produtosEstoqueBaixo,
        produtosVencendo,
        movimentacoesPorProduto: Object.values(movimentacoesPorProduto)
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de estoque:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = () => {
    const conteudo = `
Relatório de Estoque
Data: ${new Date().toLocaleDateString('pt-BR')}

PRODUTOS COM ESTOQUE BAIXO:
${data.produtosEstoqueBaixo.map(p => 
  `- ${p.nome}: ${p.quantidade_atual}/${p.quantidade_minima}`
).join('\n')}

PRODUTOS VENCENDO:
${data.produtosVencendo.map(p => 
  `- ${p.nome}: ${p.dias_para_vencer} dias`
).join('\n')}
    `;
    
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-estoque.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Botão de atualizar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatório de Estoque</h2>
        <div className="flex gap-2">
          <Button onClick={gerarRelatorio} disabled={loading} variant="outline">
            {loading ? 'Gerando...' : 'Atualizar'}
          </Button>
          <Button onClick={exportarRelatorio} className="vet-gradient text-white">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Produtos com estoque baixo */}
      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Produtos com Estoque Baixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.produtosEstoqueBaixo.length === 0 ? (
            <p className="text-muted-foreground">Nenhum produto com estoque baixo.</p>
          ) : (
            <div className="space-y-2">
              {data.produtosEstoqueBaixo.map((produto, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{produto.nome}</span>
                  <span className="text-orange-600">
                    {produto.quantidade_atual} / {produto.quantidade_minima} mínimo
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Produtos vencendo */}
      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-red-500" />
            Produtos Vencendo (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.produtosVencendo.length === 0 ? (
            <p className="text-muted-foreground">Nenhum produto vencendo nos próximos 30 dias.</p>
          ) : (
            <div className="space-y-2">
              {data.produtosVencendo.map((produto, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{produto.nome}</span>
                  <span className={`${produto.dias_para_vencer <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                    {produto.dias_para_vencer} dias
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de movimentações */}
      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle>Movimentações por Produto (últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.movimentacoesPorProduto}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
              <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
