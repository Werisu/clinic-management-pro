import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Heart, Calendar } from "lucide-react";

const appointments = [
  {
    id: 1,
    time: "09:00",
    client: "Maria Silva",
    pet: "Rex (Labrador)",
    type: "Consulta",
    status: "confirmado",
    veterinarian: "Dr. João Santos"
  },
  {
    id: 2,
    time: "10:30", 
    client: "Pedro Costa",
    pet: "Mimi (Persa)",
    type: "Vacinação",
    status: "confirmado",
    veterinarian: "Dra. Ana Oliveira"
  },
  {
    id: 3,
    time: "14:00",
    client: "Carla Mendes",
    pet: "Bolt (Poodle)",
    type: "Cirurgia",
    status: "em_andamento",
    veterinarian: "Dr. João Santos"
  },
  {
    id: 4,
    time: "15:30",
    client: "Roberto Lima",
    pet: "Mel (SRD)",
    type: "Retorno",
    status: "pendente",
    veterinarian: "Dra. Ana Oliveira"
  },
];

const statusConfig = {
  confirmado: { label: "Confirmado", color: "bg-green-100 text-green-800" },
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-100 text-blue-800" },
  concluido: { label: "Concluído", color: "bg-gray-100 text-gray-800" },
};

export function RecentAppointments() {
  return (
    <Card className="vet-card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-vet-primary" />
          Agendamentos de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {appointment.time}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{appointment.client}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{appointment.pet}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.veterinarian}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {appointment.type}
                </Badge>
                <Badge 
                  className={`text-xs ${statusConfig[appointment.status].color}`}
                  variant="outline"
                >
                  {statusConfig[appointment.status].label}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
