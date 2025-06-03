
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, Heart, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Nova Consulta",
    description: "Agendar nova consulta",
    icon: Calendar,
    href: "/agendamentos/novo",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Novo Cliente",
    description: "Cadastrar novo cliente",
    icon: Users,
    href: "/clientes/novo",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "Novo Paciente",
    description: "Cadastrar novo pet",
    icon: Heart,
    href: "/pacientes/novo", 
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    title: "Novo Prontuário",
    description: "Criar prontuário",
    icon: FileText,
    href: "/prontuarios/novo",
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

export function QuickActions() {
  return (
    <Card className="vet-card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-vet-primary" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant="outline"
              className="h-auto p-4 justify-start hover:shadow-md transition-all duration-200"
            >
              <Link to={action.href}>
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg text-white ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
