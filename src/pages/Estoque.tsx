
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { EstoqueOverview } from "@/components/EstoqueOverview";
import { ProdutosList } from "@/components/ProdutosList";
import { MovimentacoesList } from "@/components/MovimentacoesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Estoque = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border/40 bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted rounded-lg p-2" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie produtos, medicamentos e movimentações
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 animate-fade-in">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="movements">Movimentações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <EstoqueOverview />
              </TabsContent>
              
              <TabsContent value="products" className="space-y-6">
                <ProdutosList />
              </TabsContent>
              
              <TabsContent value="movements" className="space-y-6">
                <MovimentacoesList />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Estoque;
