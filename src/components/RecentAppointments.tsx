
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Heart, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Agendamento {
  id: string;
  data_hora: string;
  tipo_servico: string;
  status: string;
  observacoes?: string;
  pacientes: {
    nome: string;
    clientes: {
      nome: string;
    };
  };
}

const statusConfig = {
  agendado: { label: "Agendado", color: "bg-blue-100 text-blue-800" },
  confirmado: { label: "Confirmado", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  concluido: { label: "Concluído", color: "bg-gray-100 text-gray-800" },
  em_andamento: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
};

export function RecentAppointments() {
  const [appointments, setAppointments] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTodayAppointments();
    }
  }, [user]);

  const fetchTodayAppointments = async () => {
    try {
      const hoje = new Date();
      const inicioHoje = format(startOfDay(hoje), 'yyyy-MM-dd HH:mm:ss');
      const fimHoje = format(endOfDay(hoje), 'yyyy-MM-dd HH:mm:ss');

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          pacientes!inner(
            nome,
            clientes!inner(nome)
          )
        `)
        .eq('user_id', user?.id)
        .gte('data_hora', inicioHoje)
        .lte('data_hora', fimHoje)
        .order('data_hora', { ascending: true })
        .limit(5);

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos de hoje:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-vet-primary" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="vet-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-vet-primary" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum agendamento hoje</h3>
            <p className="text-muted-foreground">Você não tem consultas agendadas para hoje.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="vet-card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-vet-primary" />
          Agendamentos de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(appointment.data_hora), 'HH:mm', { locale: ptBR })}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{appointment.pacientes.clientes.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{appointment.pacientes.nome}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {appointment.tipo_servico}
                </Badge>
                <Badge 
                  className={`text-xs ${statusConfig[appointment.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}`}
                  variant="outline"
                >
                  {statusConfig[appointment.status as keyof typeof statusConfig]?.label || appointment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
