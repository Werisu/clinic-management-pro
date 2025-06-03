
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Calendar, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Clientes Ativos",
    value: "1,234",
    change: "+12%",
    changeType: "positive",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Pacientes Cadastrados", 
    value: "2,567",
    change: "+8%",
    changeType: "positive",
    icon: Heart,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Consultas Hoje",
    value: "24",
    change: "+3",
    changeType: "positive", 
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Receita Mensal",
    value: "R$ 45.690",
    change: "+15%",
    changeType: "positive",
    icon: TrendingUp,
    color: "text-orange-600", 
    bgColor: "bg-orange-50",
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="vet-card-shadow hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className={`font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              {' '}em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
