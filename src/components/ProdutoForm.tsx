
import { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProdutoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProdutoForm({ onSuccess, onCancel }: ProdutoFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    codigo_barras: '',
    unidade_medida: 'unidade',
    quantidade_atual: '',
    quantidade_minima: '',
    preco_custo: '',
    preco_venda: '',
    fornecedor: '',
    data_validade: '',
    lote: ''
  });
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('produtos_estoque')
        .insert([
          {
            user_id: user.id,
            nome: formData.nome,
            categoria: formData.categoria,
            descricao: formData.descricao || null,
            codigo_barras: formData.codigo_barras || null,
            unidade_medida: formData.unidade_medida,
            quantidade_atual: parseInt(formData.quantidade_atual) || 0,
            quantidade_minima: parseInt(formData.quantidade_minima) || 0,
            preco_custo: formData.preco_custo ? parseFloat(formData.preco_custo) : null,
            preco_venda: formData.preco_venda ? parseFloat(formData.preco_venda) : null,
            fornecedor: formData.fornecedor || null,
            data_validade: formData.data_validade || null,
            lote: formData.lote || null
          }
        ]);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Novo Produto</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="codigo_barras">Código de Barras</Label>
            <Input
              id="codigo_barras"
              value={formData.codigo_barras}
              onChange={(e) => handleChange('codigo_barras', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unidade_medida">Unidade de Medida</Label>
            <Select value={formData.unidade_medida} onValueChange={(value) => handleChange('unidade_medida', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unidade">Unidade</SelectItem>
                <SelectItem value="ml">Mililitro (ml)</SelectItem>
                <SelectItem value="mg">Miligrama (mg)</SelectItem>
                <SelectItem value="g">Grama (g)</SelectItem>
                <SelectItem value="kg">Quilograma (kg)</SelectItem>
                <SelectItem value="litro">Litro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantidade_atual">Quantidade Atual *</Label>
            <Input
              id="quantidade_atual"
              type="number"
              min="0"
              value={formData.quantidade_atual}
              onChange={(e) => handleChange('quantidade_atual', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantidade_minima">Quantidade Mínima *</Label>
            <Input
              id="quantidade_minima"
              type="number"
              min="0"
              value={formData.quantidade_minima}
              onChange={(e) => handleChange('quantidade_minima', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preco_custo">Preço de Custo</Label>
            <Input
              id="preco_custo"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco_custo}
              onChange={(e) => handleChange('preco_custo', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preco_venda">Preço de Venda</Label>
            <Input
              id="preco_venda"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco_venda}
              onChange={(e) => handleChange('preco_venda', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Input
              id="fornecedor"
              value={formData.fornecedor}
              onChange={(e) => handleChange('fornecedor', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lote">Lote</Label>
            <Input
              id="lote"
              value={formData.lote}
              onChange={(e) => handleChange('lote', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_validade">Data de Validade</Label>
          <Input
            id="data_validade"
            type="date"
            value={formData.data_validade}
            onChange={(e) => handleChange('data_validade', e.target.value)}
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
