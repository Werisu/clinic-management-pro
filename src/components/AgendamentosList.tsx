
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AgendamentoForm } from './AgendamentoForm';

interface Agendamento {
  id: string;
  data_hora: string;
  tipo_servico: string;
  status: string;
  observacoes: string;
  paciente_nome: string;
  cliente_nome: string;
  created_at: string;
}

export function AgendamentosList() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchAgendamentos();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'concluido':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR');
  };

  const filteredAgendamentos = agendamentos.filter(agendamento =>
    agendamento.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.tipo_servico.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="vet-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <AgendamentoForm 
              onSuccess={handleSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </Dialog>
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
                      <Badge className={getStatusColor(agendamento.status)}>
                        {agendamento.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Paciente: {agendamento.paciente_nome} (Cliente: {agendamento.cliente_nome})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Data/Hora: {formatDateTime(agendamento.data_hora)}
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
