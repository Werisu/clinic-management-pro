
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Agendamento {
  id: string;
  data_hora: string;
  tipo_servico: string;
  status: string;
  observacoes: string;
  paciente_id: string;
  paciente_nome: string;
  cliente_nome: string;
  created_at: string;
}

export function AgendamentosList() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAgendamentos();
    }
  }, [user]);

  const fetchAgendamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          pacientes!inner(nome, clientes!inner(nome))
        `)
        .order('data_hora', { ascending: true });

      if (error) throw error;
      
      const agendamentosFormatted = data?.map(agendamento => ({
        ...agendamento,
        paciente_nome: agendamento.pacientes?.nome || 'Paciente não encontrado',
        cliente_nome: agendamento.pacientes?.clientes?.nome || 'Cliente não encontrado'
      })) || [];
      
      setAgendamentos(agendamentosFormatted);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgendamentos = agendamentos.filter(agendamento =>
    agendamento.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.tipo_servico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'text-blue-600 bg-blue-50';
      case 'confirmado': return 'text-green-600 bg-green-50';
      case 'cancelado': return 'text-red-600 bg-red-50';
      case 'concluido': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

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
            <Calendar className="h-5 w-5 text-vet-primary" />
            Agendamentos
          </div>
          <Button className="vet-gradient text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </CardTitle>
        <div className="mt-4">
          <Input
            placeholder="Buscar por paciente, cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredAgendamentos.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum agendamento encontrado</h3>
            <p className="text-muted-foreground">Adicione um novo agendamento para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAgendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{agendamento.tipo_servico}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {formatDateTime(agendamento.data_hora)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Paciente: {agendamento.paciente_nome} | Cliente: {agendamento.cliente_nome}
                    </p>
                    {agendamento.observacoes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Obs: {agendamento.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash className="h-4 w-4" />
                    </Button>
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
