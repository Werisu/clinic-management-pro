
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/components/ui/sonner";

interface Cliente {
  id: string;
  nome: string;
}

interface PacienteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PacienteForm({ onSuccess, onCancel }: PacienteFormProps) {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    especie: '',
    raca: '',
    idade: '',
    peso: '',
    cliente_id: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClientes();
    }
  }, [user]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .insert([{
          nome: formData.nome,
          especie: formData.especie,
          raca: formData.raca || null,
          idade: formData.idade ? parseInt(formData.idade) : null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          cliente_id: formData.cliente_id,
          user_id: user.id
        }]);

      if (error) throw error;
      
      toast.success('Paciente cadastrado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      toast.error('Erro ao cadastrar paciente');
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
        <DialogTitle>Novo Paciente</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Cliente *</label>
          <Select value={formData.cliente_id} onValueChange={(value) => handleChange('cliente_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Nome do Pet *</label>
          <Input
            required
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Nome do animal"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Espécie *</label>
          <Input
            required
            value={formData.especie}
            onChange={(e) => handleChange('especie', e.target.value)}
            placeholder="Ex: Cão, Gato, Pássaro"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Raça</label>
          <Input
            value={formData.raca}
            onChange={(e) => handleChange('raca', e.target.value)}
            placeholder="Raça do animal"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Idade (anos)</label>
            <Input
              type="number"
              value={formData.idade}
              onChange={(e) => handleChange('idade', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Peso (kg)</label>
            <Input
              type="number"
              step="0.1"
              value={formData.peso}
              onChange={(e) => handleChange('peso', e.target.value)}
              placeholder="0.0"
              min="0"
            />
          </div>
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
