
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Calendar, TrendingUp } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfDay, endOfDay } from 'date-fns';

interface DashboardStatsData {
  clientesAtivos: number;
  pacientesCadastrados: number;
  consultasHoje: number;
  receitaMensal: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData>({
    clientesAtivos: 0,
    pacientesCadastrados: 0,
    consultasHoje: 0,
    receitaMensal: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // Buscar clientes ativos
      const { data: clientes } = await supabase
        .from('clientes')
        .select('id')
        .eq('user_id', user?.id);

      // Buscar pacientes cadastrados
      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user?.id);

      // Buscar consultas de hoje
      const hoje = new Date();
      const inicioHoje = format(startOfDay(hoje), 'yyyy-MM-dd HH:mm:ss');
      const fimHoje = format(endOfDay(hoje), 'yyyy-MM-dd HH:mm:ss');

      const { data: consultasHoje } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('user_id', user?.id)
        .gte('data_hora', inicioHoje)
        .lte('data_hora', fimHoje);

      // Buscar receita do mês atual
      const inicioMes = format(new Date(hoje.getFullYear(), hoje.getMonth(), 1), 'yyyy-MM-dd');
      const fimMes = format(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0), 'yyyy-MM-dd');

      const { data: receitas } = await supabase
        .from('transacoes_financeiras')
        .select('valor')
        .eq('user_id', user?.id)
        .eq('tipo', 'receita')
        .eq('status', 'confirmado')
        .gte('data_transacao', inicioMes)
        .lte('data_transacao', fimMes);

      const receitaMensal = receitas?.reduce((total, receita) => total + Number(receita.valor), 0) || 0;

      setStats({
        clientesAtivos: clientes?.length || 0,
        pacientesCadastrados: pacientes?.length || 0,
        consultasHoje: consultasHoje?.length || 0,
        receitaMensal
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
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

  const statsConfig = [
    {
      title: "Clientes Ativos",
      value: stats.clientesAtivos.toString(),
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pacientes Cadastrados", 
      value: stats.pacientesCadastrados.toString(),
      change: "+8%",
      changeType: "positive",
      icon: Heart,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Consultas Hoje",
      value: stats.consultasHoje.toString(),
      change: loading ? "..." : "+3",
      changeType: "positive", 
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Receita Mensal",
      value: formatCurrency(stats.receitaMensal),
      change: "+15%",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map((i) => (
          <Card key={i} className="vet-card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => (
        <Card key={stat.title} className="vet-card-shadow hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className={`font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              {' '}em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
