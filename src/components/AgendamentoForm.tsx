
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/components/ui/sonner";

interface Paciente {
  id: string;
  nome: string;
  clientes: { nome: string };
}

interface AgendamentoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AgendamentoForm({ onSuccess, onCancel }: AgendamentoFormProps) {
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    data_hora: '',
    tipo_servico: '',
    status: 'agendado',
    observacoes: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPacientes();
    }
  }, [user]);

  const fetchPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id,
          nome,
          clientes!inner(nome)
        `)
        .order('nome');

      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('agendamentos')
        .insert([{
          paciente_id: formData.paciente_id,
          data_hora: formData.data_hora,
          tipo_servico: formData.tipo_servico,
          status: formData.status,
          observacoes: formData.observacoes || null,
          user_id: user.id
        }]);

      if (error) throw error;
      
      toast.success('Agendamento criado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Novo Agendamento</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Paciente *</label>
          <Select value={formData.paciente_id} onValueChange={(value) => handleChange('paciente_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {pacientes.map((paciente) => (
                <SelectItem key={paciente.id} value={paciente.id}>
                  {paciente.nome} - {paciente.clientes?.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Data e Hora *</label>
          <Input
            required
            type="datetime-local"
            value={formData.data_hora}
            onChange={(e) => handleChange('data_hora', e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Tipo de Serviço *</label>
          <Select value={formData.tipo_servico} onValueChange={(value) => handleChange('tipo_servico', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consulta">Consulta</SelectItem>
              <SelectItem value="vacinacao">Vacinação</SelectItem>
              <SelectItem value="cirurgia">Cirurgia</SelectItem>
              <SelectItem value="exame">Exame</SelectItem>
              <SelectItem value="banho-tosa">Banho e Tosa</SelectItem>
              <SelectItem value="emergencia">Emergência</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Observações</label>
          <Textarea
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Observações sobre o agendamento"
            rows={3}
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
