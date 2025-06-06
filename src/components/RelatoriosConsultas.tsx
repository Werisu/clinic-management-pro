
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsultasRelatorio {
  totalConsultas: number;
  consultasPorStatus: Array<{ name: string; value: number; color: string }>;
  consultasPorTipo: Array<{ name: string; value: number }>;
  consultasPorMes: Array<{ mes: string; consultas: number }>;
}

export function RelatoriosConsultas() {
  const [data, setData] = useState<ConsultasRelatorio>({
    totalConsultas: 0,
    consultasPorStatus: [],
    consultasPorTipo: [],
    consultasPorMes: []
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
      
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select('*')
        .gte('data_hora', inicio.toISOString())
        .lte('data_hora', fim.toISOString());

      if (error) throw error;

      const totalConsultas = agendamentos?.length || 0;

      // Consultas por status
      const statusCount = agendamentos?.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const consultasPorStatus = Object.entries(statusCount).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: ['#10b981', '#f59e0b', '#ef4444', '#6366f1'][index % 4]
      }));

      // Consultas por tipo de serviço
      const tipoCount = agendamentos?.reduce((acc, a) => {
        acc[a.tipo_servico] = (acc[a.tipo_servico] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const consultasPorTipo = Object.entries(tipoCount).map(([name, value]) => ({
        name,
        value
      }));

      // Consultas por mês (últimos 6 meses)
      const consultasPorMes = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const inicioMes = startOfMonth(date);
        const fimMes = endOfMonth(date);
        
        const consultasMes = agendamentos?.filter(a => {
          const dataAgendamento = new Date(a.data_hora);
          return dataAgendamento >= inicioMes && dataAgendamento <= fimMes;
        }).length || 0;

        consultasPorMes.push({
          mes: format(date, 'MMM', { locale: ptBR }),
          consultas: consultasMes
        });
      }

      setData({
        totalConsultas,
        consultasPorStatus,
        consultasPorTipo,
        consultasPorMes
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = () => {
    const conteudo = `
Relatório de Consultas
Data: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}

Total de Consultas: ${data.totalConsultas}

Consultas por Status:
${data.consultasPorStatus.map(s => `- ${s.name}: ${s.value}`).join('\n')}

Consultas por Tipo:
${data.consultasPorTipo.map(t => `- ${t.name}: ${t.value}`).join('\n')}
    `;
    
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-consultas.txt';
    a.click();
    URL.revokeObjectURL(url);
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

            <div className="flex items-end gap-2">
              <Button onClick={gerarRelatorio} disabled={loading} className="vet-gradient text-white">
                {loading ? 'Gerando...' : 'Atualizar'}
              </Button>
              <Button onClick={exportarRelatorio} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card className="vet-card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
          <Users className="h-4 w-4 text-vet-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalConsultas}</div>
          <p className="text-xs text-muted-foreground">
            No período selecionado
          </p>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="vet-card-shadow">
          <CardHeader>
            <CardTitle>Consultas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.consultasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consultas" fill="#3b82f6" name="Consultas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="vet-card-shadow">
          <CardHeader>
            <CardTitle>Consultas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.consultasPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.consultasPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tipos de serviço */}
      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle>Consultas por Tipo de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.consultasPorTipo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" name="Consultas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
