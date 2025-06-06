
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TransacaoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransacaoForm({ onSuccess, onCancel }: TransacaoFormProps) {
  const [formData, setFormData] = useState({
    tipo: '',
    categoria: '',
    descricao: '',
    valor: '',
    data_transacao: new Date(),
    forma_pagamento: 'dinheiro',
    status: 'confirmado',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const { user } = useAuth();

  const categorias = {
    receita: [
      'Consulta',
      'Cirurgia',
      'Vacinação',
      'Exames',
      'Medicamentos',
      'Internação',
      'Produtos',
      'Outros'
    ],
    despesa: [
      'Medicamentos',
      'Equipamentos',
      'Fornecedores',
      'Salários',
      'Aluguel',
      'Energia',
      'Telefone',
      'Marketing',
      'Outros'
    ]
  };

  useEffect(() => {
    if (user) {
      fetchPacientes();
      fetchAgendamentos();
    }
  }, [user]);

  const fetchPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    }
  };

  const fetchAgendamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          tipo_servico,
          data_hora,
          pacientes!inner(nome)
        `)
        .eq('status', 'agendado')
        .order('data_hora');
      
      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transacoes_financeiras')
        .insert({
          user_id: user.id,
          tipo: formData.tipo,
          categoria: formData.categoria,
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          data_transacao: format(formData.data_transacao, 'yyyy-MM-dd'),
          forma_pagamento: formData.forma_pagamento,
          status: formData.status,
          observacoes: formData.observacoes || null
        });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nova Transação Financeira</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value, categoria: '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              disabled={!formData.tipo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {formData.tipo && categorias[formData.tipo as keyof typeof categorias]?.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Descrição da transação"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data da Transação *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.data_transacao && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data_transacao ? (
                    format(formData.data_transacao, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data_transacao}
                  onSelect={(date) => date && setFormData({ ...formData, data_transacao: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
            <Select value={formData.forma_pagamento} onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Observações adicionais (opcional)"
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Salvando...' : 'Salvar Transação'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
