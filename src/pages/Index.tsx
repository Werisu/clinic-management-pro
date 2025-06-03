
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentAppointments } from "@/components/RecentAppointments";
import { QuickActions } from "@/components/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
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
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
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
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-sm font-medium text-yellow-800">
                          5 vacinas vencendo esta semana
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                        <p className="text-sm font-medium text-red-800">
                          Estoque baixo: Ração Premium (3 unidades)
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-sm font-medium text-blue-800">
                          12 consultas pendentes de confirmação
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <QuickActions />
                
                {/* Financial Overview */}
                <Card className="vet-card-shadow">
                  <CardHeader>
                    <CardTitle className="vet-text-gradient">
                      Resumo Financeiro - Dezembro 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Receita do Mês</span>
                        <span className="font-bold text-green-600">R$ 45.690,00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Despesas</span>
                        <span className="font-bold text-red-600">R$ 18.240,00</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Lucro Líquido</span>
                          <span className="font-bold text-xl text-green-600">
                            R$ 27.450,00
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="vet-card-shadow">
                  <CardHeader>
                    <CardTitle>Estatísticas Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">18</div>
                        <div className="text-sm text-muted-foreground">Cirurgias este mês</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">124</div>
                        <div className="text-sm text-muted-foreground">Vacinas aplicadas</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">89%</div>
                        <div className="text-sm text-muted-foreground">Taxa de ocupação</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">4.8</div>
                        <div className="text-sm text-muted-foreground">Avaliação média</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
