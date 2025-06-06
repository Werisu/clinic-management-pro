
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RelatoriosFinanceiros } from "@/components/RelatoriosFinanceiros";
import { RelatoriosEstoque } from "@/components/RelatoriosEstoque";
import { RelatoriosConsultas } from "@/components/RelatoriosConsultas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Relatorios = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border/40 bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted rounded-lg p-2" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
                <p className="text-sm text-muted-foreground">
                  Analise dados e gere relatórios detalhados
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 animate-fade-in">
            <Tabs defaultValue="financial" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="stock">Estoque</TabsTrigger>
                <TabsTrigger value="appointments">Consultas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="financial" className="space-y-6">
                <RelatoriosFinanceiros />
              </TabsContent>
              
              <TabsContent value="stock" className="space-y-6">
                <RelatoriosEstoque />
              </TabsContent>
              
              <TabsContent value="appointments" className="space-y-6">
                <RelatoriosConsultas />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Relatorios;
