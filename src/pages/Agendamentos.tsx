
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, User, Heart } from "lucide-react";

const Agendamentos = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border/40 bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted rounded-lg p-2" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie consultas e procedimentos
                </p>
              </div>
            </div>
            <Button className="vet-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </header>

          <div className="flex-1 p-6 animate-fade-in">
            <Card className="vet-card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-vet-primary" />
                  Sistema de Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Em Desenvolvimento</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    O módulo de agendamentos incluirá calendário interativo, 
                    gestão de horários, confirmações automáticas e muito mais.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Agendamentos;
