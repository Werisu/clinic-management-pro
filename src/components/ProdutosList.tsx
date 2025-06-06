
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash, Package, AlertTriangle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProdutoForm } from './ProdutoForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  codigo_barras?: string;
  unidade_medida: string;
  quantidade_atual: number;
  quantidade_minima: number;
  preco_custo?: number;
  preco_venda?: number;
  fornecedor?: string;
  data_validade?: string;
  lote?: string;
  ativo: boolean;
  created_at: string;
}

export function ProdutosList() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProdutos();
    }
  }, [user]);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_estoque')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchProdutos();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const { error } = await supabase
          .from('produtos_estoque')
          .update({ ativo: false })
          .eq('id', id);

        if (error) throw error;
        fetchProdutos();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isEstoqueBaixo = (produto: Produto) => {
    return produto.quantidade_atual <= produto.quantidade_minima;
  };

  const isVencendo = (produto: Produto) => {
    if (!produto.data_validade) return false;
    const now = new Date();
    const dataValidade = new Date(produto.data_validade);
    const trintaDias = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return dataValidade <= trintaDias;
  };

  const categorias = [...new Set(produtos.map(p => p.categoria))];

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === 'todos' || produto.categoria === filterCategoria;
    
    return matchesSearch && matchesCategoria;
  });

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
            <Package className="h-5 w-5 text-vet-primary" />
            Produtos em Estoque
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="vet-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <ProdutoForm 
              onSuccess={handleSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </Dialog>
        </CardTitle>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredProdutos.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">Adicione um novo produto para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProdutos.map((produto) => (
              <div
                key={produto.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{produto.nome}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {produto.categoria}
                      </span>
                      {isEstoqueBaixo(produto) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Estoque Baixo
                        </span>
                      )}
                      {isVencendo(produto) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Vencendo
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>
                        <strong>Quantidade:</strong> {produto.quantidade_atual} {produto.unidade_medida}
                      </div>
                      <div>
                        <strong>Mínimo:</strong> {produto.quantidade_minima} {produto.unidade_medida}
                      </div>
                      {produto.preco_custo && (
                        <div>
                          <strong>Custo:</strong> {formatCurrency(produto.preco_custo)}
                        </div>
                      )}
                      {produto.data_validade && (
                        <div>
                          <strong>Validade:</strong> {format(new Date(produto.data_validade), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      )}
                    </div>
                    
                    {produto.descricao && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Descrição:</strong> {produto.descricao}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(produto.id)}
                    >
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
