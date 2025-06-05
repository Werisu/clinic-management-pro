
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash, FileText } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProntuarioForm } from './ProntuarioForm';

interface Prontuario {
  id: string;
  data_consulta: string;
  motivo_consulta: string;
  sintomas: string;
  diagnostico: string;
  tratamento: string;
  medicamentos: string;
  observacoes: string;
  peso_atual: number;
  temperatura: number;
  paciente_nome: string;
  cliente_nome: string;
  created_at: string;
}

export function ProntuariosList() {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProntuarios();
    }
  }, [user]);

  const fetchProntuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select(`
          *,
          pacientes!inner(nome, clientes!inner(nome))
        `)
        .order('data_consulta', { ascending: false });

      if (error) throw error;
      
      const prontuariosFormatted = data?.map(prontuario => ({
        ...prontuario,
        paciente_nome: prontuario.pacientes?.nome || 'Paciente não encontrado',
        cliente_nome: prontuario.pacientes?.clientes?.nome || 'Cliente não encontrado'
      })) || [];
      
      setProntuarios(prontuariosFormatted);
    } catch (error) {
      console.error('Erro ao buscar prontuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchProntuarios();
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR');
  };

  const filteredProntuarios = prontuarios.filter(prontuario =>
    prontuario.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prontuario.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prontuario.motivo_consulta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prontuario.diagnostico && prontuario.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <FileText className="h-5 w-5 text-vet-primary" />
            Prontuários
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="vet-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Prontuário
              </Button>
            </DialogTrigger>
            <ProntuarioForm 
              onSuccess={handleSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </Dialog>
        </CardTitle>
        <div className="mt-4">
          <Input
            placeholder="Buscar por paciente, cliente, motivo ou diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredProntuarios.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum prontuário encontrado</h3>
            <p className="text-muted-foreground">Adicione um novo prontuário para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProntuarios.map((prontuario) => (
              <div
                key={prontuario.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{prontuario.motivo_consulta}</h3>
                    <p className="text-muted-foreground">
                      Paciente: {prontuario.paciente_nome} (Cliente: {prontuario.cliente_nome})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Data: {formatDateTime(prontuario.data_consulta)}
                    </p>
                    {prontuario.diagnostico && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Diagnóstico: {prontuario.diagnostico}
                      </p>
                    )}
                    {(prontuario.peso_atual || prontuario.temperatura) && (
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        {prontuario.peso_atual && <span>Peso: {prontuario.peso_atual}kg</span>}
                        {prontuario.temperatura && <span>Temp: {prontuario.temperatura}°C</span>}
                      </div>
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
