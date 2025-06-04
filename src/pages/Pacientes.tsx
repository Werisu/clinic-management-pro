
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PacientesList } from "@/components/PacientesList";

const Pacientes = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border/40 bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted rounded-lg p-2" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie informações dos pets
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 animate-fade-in">
            <PacientesList />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Pacientes;
