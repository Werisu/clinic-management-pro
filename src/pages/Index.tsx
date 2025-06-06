
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentAppointments } from "@/components/RecentAppointments";
import { QuickActions } from "@/components/QuickActions";
import { FinanceiroOverview } from "@/components/FinanceiroOverview";
import { EstoqueOverview } from "@/components/EstoqueOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Search, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [alertas, setAlertas] = useState({
    vacinasVencendo: 0,
    estoquesBaixos: 0,
    consultasPendentes: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAlertas();
    }
  }, [user]);

  const fetchAlertas = async () => {
    try {
      // Consultas pendentes de confirmação
      const { data: consultasPendentes } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('user_id', user?.id)
        .eq('status', 'agendado');

      // Produtos com estoque baixo
      const { data: produtosEstoqueBaixo } = await supabase
        .from('produtos_estoque')
        .select('id, nome, quantidade_atual, quantidade_minima')
        .eq('user_id', user?.id)
        .eq('ativo', true);

      const estoquesBaixos = produtosEstoqueBaixo?.filter(
        produto => produto.quantidade_atual <= produto.quantidade_minima
      ).length || 0;

      // Produtos vencendo em 30 dias
      const trintaDias = new Date();
      trintaDias.setDate(trintaDias.getDate() + 30);
      
      const { data: produtosVencendo } = await supabase
        .from('produtos_estoque')
        .select('id')
        .eq('user_id', user?.id)
        .eq('ativo', true)
        .not('data_validade', 'is', null)
        .lte('data_validade', trintaDias.toISOString().split('T')[0]);

      setAlertas({
        vacinasVencendo: produtosVencendo?.length || 0,
        estoquesBaixos,
        consultasPendentes: consultasPendentes?.length || 0
      });
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border/40 bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted rounded-lg p-2" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo ao sistema VetCare
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar clientes, pets..." 
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {(alertas.vacinasVencendo + alertas.estoquesBaixos + alertas.consultasPendentes) > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {alertas.vacinasVencendo + alertas.estoquesBaixos + alertas.consultasPendentes}
                  </span>
                )}
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6 animate-fade-in">
            {/* Statistics */}
            <DashboardStats />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <RecentAppointments />
                
                {/* Alerts Card */}
                <Card className="vet-card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Bell className="h-5 w-5" />
                      Alertas Importantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(alertas.vacinasVencendo + alertas.estoquesBaixos + alertas.consultasPendentes) === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Nenhum alerta no momento</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alertas.vacinasVencendo > 0 && (
                          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <p className="text-sm font-medium text-yellow-800">
                              {alertas.vacinasVencendo} produtos vencendo em 30 dias
                            </p>
                          </div>
                        )}
                        {alertas.estoquesBaixos > 0 && (
                          <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                            <p className="text-sm font-medium text-red-800">
                              {alertas.estoquesBaixos} produtos com estoque baixo
                            </p>
                          </div>
                        )}
                        {alertas.consultasPendentes > 0 && (
                          <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <p className="text-sm font-medium text-blue-800">
                              {alertas.consultasPendentes} consultas pendentes de confirmação
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <QuickActions />
                
                {/* Financial Overview */}
                <FinanceiroOverview />

                {/* Estoque Overview */}
                <EstoqueOverview />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
