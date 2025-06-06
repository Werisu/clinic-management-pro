
import { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MovimentacaoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Produto {
  id: string;
  nome: string;
  quantidade_atual: number;
  unidade_medida: string;
}

export function MovimentacaoForm({ onSuccess, onCancel }: MovimentacaoFormProps) {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo: '',
    quantidade: '',
    motivo: '',
    observacoes: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_estoque')
        .select('id, nome, quantidade_atual, unidade_medida')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleProdutoChange = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    setProdutoSelecionado(produto || null);
    setFormData(prev => ({ ...prev, produto_id: produtoId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !produtoSelecionado) return;

    const quantidade = parseInt(formData.quantidade);
    const quantidadeAnterior = produtoSelecionado.quantidade_atual;
    let quantidadeNova = quantidadeAnterior;

    switch (formData.tipo) {
      case 'entrada':
        quantidadeNova = quantidadeAnterior + quantidade;
        break;
      case 'saida':
        quantidadeNova = quantidadeAnterior - quantidade;
        break;
      case 'ajuste':
        quantidadeNova = quantidade;
        break;
    }

    if (quantidadeNova < 0) {
      alert('A quantidade não pode ficar negativa!');
      return;
    }

    setLoading(true);
    try {
      // Iniciar transação
      const { error: movError } = await supabase
        .from('movimentacoes_estoque')
        .insert([
          {
            user_id: user.id,
            produto_id: formData.produto_id,
            tipo: formData.tipo,
            quantidade: quantidade,
            quantidade_anterior: quantidadeAnterior,
            quantidade_nova: quantidadeNova,
            motivo: formData.motivo || null,
            observacoes: formData.observacoes || null
          }
        ]);

      if (movError) throw movError;

      // Atualizar quantidade do produto
      const { error: prodError } = await supabase
        .from('produtos_estoque')
        .update({ quantidade_atual: quantidadeNova })
        .eq('id', formData.produto_id);

      if (prodError) throw prodError;

      onSuccess();
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Nova Movimentação</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="produto_id">Produto *</Label>
          <Select value={formData.produto_id} onValueChange={handleProdutoChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {produtos.map(produto => (
                <SelectItem key={produto.id} value={produto.id}>
                  {produto.nome} (Atual: {produto.quantidade_atual} {produto.unidade_medida})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Movimentação *</Label>
          <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
              <SelectItem value="ajuste">Ajuste</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantidade">
            {formData.tipo === 'ajuste' ? 'Nova Quantidade *' : 'Quantidade *'}
          </Label>
          <Input
            id="quantidade"
            type="number"
            min="1"
            value={formData.quantidade}
            onChange={(e) => handleChange('quantidade', e.target.value)}
            required
          />
          {produtoSelecionado && (
            <p className="text-xs text-muted-foreground">
              Estoque atual: {produtoSelecionado.quantidade_atual} {produtoSelecionado.unidade_medida}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivo">Motivo</Label>
          <Input
            id="motivo"
            value={formData.motivo}
            onChange={(e) => handleChange('motivo', e.target.value)}
            placeholder="Ex: Compra, Venda, Uso em consulta..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="vet-gradient text-white">
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
