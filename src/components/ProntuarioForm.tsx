
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

interface ProntuarioFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProntuarioForm({ onSuccess, onCancel }: ProntuarioFormProps) {
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    data_consulta: '',
    motivo_consulta: '',
    sintomas: '',
    diagnostico: '',
    tratamento: '',
    medicamentos: '',
    observacoes: '',
    peso_atual: '',
    temperatura: ''
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
        .from('prontuarios')
        .insert([{
          paciente_id: formData.paciente_id,
          data_consulta: formData.data_consulta || new Date().toISOString(),
          motivo_consulta: formData.motivo_consulta,
          sintomas: formData.sintomas || null,
          diagnostico: formData.diagnostico || null,
          tratamento: formData.tratamento || null,
          medicamentos: formData.medicamentos || null,
          observacoes: formData.observacoes || null,
          peso_atual: formData.peso_atual ? parseFloat(formData.peso_atual) : null,
          temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
          user_id: user.id
        }]);

      if (error) throw error;
      
      toast.success('Prontuário criado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar prontuário:', error);
      toast.error('Erro ao criar prontuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Novo Prontuário</DialogTitle>
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
          <label className="text-sm font-medium">Data da Consulta</label>
          <Input
            type="datetime-local"
            value={formData.data_consulta}
            onChange={(e) => handleChange('data_consulta', e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Motivo da Consulta *</label>
          <Textarea
            required
            value={formData.motivo_consulta}
            onChange={(e) => handleChange('motivo_consulta', e.target.value)}
            placeholder="Descreva o motivo da consulta"
            rows={2}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Sintomas</label>
          <Textarea
            value={formData.sintomas}
            onChange={(e) => handleChange('sintomas', e.target.value)}
            placeholder="Descreva os sintomas observados"
            rows={2}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Diagnóstico</label>
          <Textarea
            value={formData.diagnostico}
            onChange={(e) => handleChange('diagnostico', e.target.value)}
            placeholder="Diagnóstico da consulta"
            rows={2}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Tratamento</label>
          <Textarea
            value={formData.tratamento}
            onChange={(e) => handleChange('tratamento', e.target.value)}
            placeholder="Tratamento prescrito"
            rows={2}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Medicamentos</label>
          <Textarea
            value={formData.medicamentos}
            onChange={(e) => handleChange('medicamentos', e.target.value)}
            placeholder="Medicamentos prescritos"
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Peso Atual (kg)</label>
            <Input
              type="number"
              step="0.1"
              value={formData.peso_atual}
              onChange={(e) => handleChange('peso_atual', e.target.value)}
              placeholder="0.0"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Temperatura (°C)</label>
            <Input
              type="number"
              step="0.1"
              value={formData.temperatura}
              onChange={(e) => handleChange('temperatura', e.target.value)}
              placeholder="38.5"
              min="30"
              max="45"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Observações</label>
          <Textarea
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Observações gerais"
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
