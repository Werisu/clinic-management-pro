
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash, Heart } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PacienteForm } from './PacienteForm';

interface Paciente {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  peso: number;
  cliente_id: string;
  cliente_nome: string;
  created_at: string;
}

export function PacientesList() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
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
          *,
          clientes!inner(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const pacientesFormatted = data?.map(paciente => ({
        ...paciente,
        cliente_nome: paciente.clientes?.nome || 'Cliente não encontrado'
      })) || [];
      
      setPacientes(pacientesFormatted);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchPacientes();
  };

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Heart className="h-5 w-5 text-vet-primary" />
            Pacientes
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="vet-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <PacienteForm 
              onSuccess={handleSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </Dialog>
        </CardTitle>
        <div className="mt-4">
          <Input
            placeholder="Buscar por nome, espécie ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredPacientes.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground">Adicione um novo paciente para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPacientes.map((paciente) => (
              <div
                key={paciente.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{paciente.nome}</h3>
                    <p className="text-muted-foreground">{paciente.especie} - {paciente.raca}</p>
                    <p className="text-sm text-muted-foreground">
                      Idade: {paciente.idade} anos | Peso: {paciente.peso}kg
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {paciente.cliente_nome}
                    </p>
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
