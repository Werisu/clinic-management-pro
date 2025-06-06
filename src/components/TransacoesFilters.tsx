
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransacoesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterTipo: string;
  onTipoChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
}

export function TransacoesFilters({
  searchTerm,
  onSearchChange,
  filterTipo,
  onTipoChange,
  filterStatus,
  onStatusChange
}: TransacoesFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      <Input
        placeholder="Buscar por descrição ou categoria..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <Select value={filterTipo} onValueChange={onTipoChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="receita">Receita</SelectItem>
          <SelectItem value="despesa">Despesa</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="confirmado">Confirmado</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
