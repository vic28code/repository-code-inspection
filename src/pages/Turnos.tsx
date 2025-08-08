import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Search, 
  Filter, 
  MoreHorizontal,
  RefreshCw,
  Users,
  AlertCircle,
  Eye,
  Edit,
  CalendarClock
} from "lucide-react";

interface Turno {
  id: string;
  numero: string;
  cliente: {
    nombre: string;
    documento: string;
    telefono?: string;
  };
  sucursal: string;
  kiosko: string;
  categoria: string;
  estado: 'espera' | 'atendido' | 'perdido' | 'reagendado';
  fechaCreacion: string;
  horaCreacion: string;
  fechaCita?: string;
  horaCita?: string;
  posicionFila: number;
  tiempoEspera: number;
  observaciones?: string;
}

const mockTurnos: Turno[] = [
  {
    id: "1",
    numero: "A-001",
    cliente: { nombre: "Juan Pérez", documento: "12345678", telefono: "555-0123" },
    sucursal: "Sucursal Centro",
    kiosko: "Kiosko-001",
    categoria: "Atención General",
    estado: "espera",
    fechaCreacion: "2024-01-15",
    horaCreacion: "09:30",
    posicionFila: 1,
    tiempoEspera: 15
  },
  {
    id: "2",
    numero: "B-002",
    cliente: { nombre: "María García", documento: "87654321", telefono: "555-0456" },
    sucursal: "Sucursal Norte",
    kiosko: "Kiosko-002",
    categoria: "Consultas",
    estado: "atendido",
    fechaCreacion: "2024-01-15",
    horaCreacion: "09:45",
    fechaCita: "2024-01-15",
    horaCita: "10:00",
    posicionFila: 0,
    tiempoEspera: 8
  },
  {
    id: "3",
    numero: "C-003",
    cliente: { nombre: "Carlos López", documento: "11223344" },
    sucursal: "Sucursal Sur",
    kiosko: "Kiosko-003",
    categoria: "Reclamos",
    estado: "perdido",
    fechaCreacion: "2024-01-15",
    horaCreacion: "10:00",
    posicionFila: 0,
    tiempoEspera: 45,
    observaciones: "Cliente no se presentó"
  },
  {
    id: "4",
    numero: "A-004",
    cliente: { nombre: "Ana Martínez", documento: "99887766", telefono: "555-0789" },
    sucursal: "Sucursal Centro",
    kiosko: "Kiosko-001",
    categoria: "Atención General",
    estado: "reagendado",
    fechaCreacion: "2024-01-15",
    horaCreacion: "10:15",
    fechaCita: "2024-01-16",
    horaCita: "09:00",
    posicionFila: 0,
    tiempoEspera: 0,
    observaciones: "Reagendado por solicitud del cliente"
  }
];

const Turnos = () => {
  const [turnos, setTurnos] = useState<Turno[]>(mockTurnos);
  const [filtros, setFiltros] = useState({
    sucursal: "",
    kiosko: "",
    categoria: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
    busqueda: ""
  });
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalReasignar, setModalReasignar] = useState(false);
  const { toast } = useToast();

  // Calcular KPIs
  const kpis = {
    enEspera: turnos.filter(t => t.estado === 'espera').length,
    atendidos: turnos.filter(t => t.estado === 'atendido').length,
    perdidos: turnos.filter(t => t.estado === 'perdido').length,
    reagendados: turnos.filter(t => t.estado === 'reagendado').length
  };

  // Filtrar turnos
  const turnosFiltrados = turnos.filter(turno => {
    const cumpleFiltros = (
      (!filtros.sucursal || turno.sucursal.includes(filtros.sucursal)) &&
      (!filtros.kiosko || turno.kiosko.includes(filtros.kiosko)) &&
      (!filtros.categoria || turno.categoria.includes(filtros.categoria)) &&
      (!filtros.estado || turno.estado === filtros.estado) &&
      (!filtros.fechaDesde || turno.fechaCreacion >= filtros.fechaDesde) &&
      (!filtros.fechaHasta || turno.fechaCreacion <= filtros.fechaHasta) &&
      (!filtros.busqueda || 
        turno.numero.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        turno.cliente.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        turno.cliente.documento.includes(filtros.busqueda)
      )
    );
    return cumpleFiltros;
  });

  const getEstadoBadge = (estado: string) => {
    const variants = {
      espera: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      atendido: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      perdido: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      reagendado: { variant: "outline" as const, icon: Calendar, color: "text-blue-600" }
    };
    
    const config = variants[estado as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const cambiarEstadoTurno = (turnoId: string, nuevoEstado: Turno['estado'], observaciones?: string) => {
    setTurnos(prev => prev.map(turno => 
      turno.id === turnoId 
        ? { ...turno, estado: nuevoEstado, observaciones }
        : turno
    ));
    toast({
      title: "Estado actualizado",
      description: `El turno ha sido marcado como ${nuevoEstado}.`
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      sucursal: "",
      kiosko: "",
      categoria: "",
      estado: "",
      fechaDesde: "",
      fechaHasta: "",
      busqueda: ""
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-admin-text-primary">Gestión de Turnos</h1>
          <p className="text-admin-text-secondary">Administra y monitorea los turnos en tiempo real</p>
        </div>
        <Button className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-admin-surface border-admin-border-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-admin-text-secondary">En Espera</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-text-primary">{kpis.enEspera}</div>
            <p className="text-xs text-admin-text-muted">Turnos pendientes</p>
          </CardContent>
        </Card>

        <Card className="bg-admin-surface border-admin-border-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-admin-text-secondary">Atendidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-text-primary">{kpis.atendidos}</div>
            <p className="text-xs text-admin-text-muted">Turnos completados</p>
          </CardContent>
        </Card>

        <Card className="bg-admin-surface border-admin-border-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-admin-text-secondary">Perdidos</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-text-primary">{kpis.perdidos}</div>
            <p className="text-xs text-admin-text-muted">No se presentaron</p>
          </CardContent>
        </Card>

        <Card className="bg-admin-surface border-admin-border-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-admin-text-secondary">Reagendados</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-text-primary">{kpis.reagendados}</div>
            <p className="text-xs text-admin-text-muted">Reprogramados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-admin-surface border-admin-border-light">
        <CardHeader>
          <CardTitle className="text-admin-text-primary flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="busqueda">Buscar por N° o Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-admin-text-muted" />
                <Input
                  id="busqueda"
                  placeholder="A-001, Juan Pérez..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sucursal</Label>
              <Select value={filtros.sucursal} onValueChange={(value) => setFiltros(prev => ({ ...prev, sucursal: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las sucursales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Centro">Sucursal Centro</SelectItem>
                  <SelectItem value="Norte">Sucursal Norte</SelectItem>
                  <SelectItem value="Sur">Sucursal Sur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={filtros.categoria} onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Atención General">Atención General</SelectItem>
                  <SelectItem value="Consultas">Consultas</SelectItem>
                  <SelectItem value="Reclamos">Reclamos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtros.estado} onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="espera">En Espera</SelectItem>
                  <SelectItem value="atendido">Atendido</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                  <SelectItem value="reagendado">Reagendado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="fechaDesde">Fecha Desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaHasta">Fecha Hasta</Label>
              <Input
                id="fechaHasta"
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              />
            </div>
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Turnos */}
      <Card className="bg-admin-surface border-admin-border-light">
        <CardHeader>
          <CardTitle className="text-admin-text-primary">
            Lista de Turnos ({turnosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Turno</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Tiempo Espera</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turnosFiltrados.map((turno) => (
                <TableRow key={turno.id}>
                  <TableCell className="font-medium">{turno.numero}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{turno.cliente.nombre}</p>
                      <p className="text-sm text-admin-text-muted">{turno.cliente.documento}</p>
                    </div>
                  </TableCell>
                  <TableCell>{turno.sucursal}</TableCell>
                  <TableCell>{turno.categoria}</TableCell>
                  <TableCell>{getEstadoBadge(turno.estado)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{turno.fechaCreacion}</p>
                      <p className="text-admin-text-muted">{turno.horaCreacion}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${turno.tiempoEspera > 30 ? 'text-red-600' : 'text-admin-text-primary'}`}>
                      {turno.tiempoEspera} min
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTurnoSeleccionado(turno);
                          setModalDetalle(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {turno.estado === 'espera' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => cambiarEstadoTurno(turno.id, 'atendido')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => cambiarEstadoTurno(turno.id, 'perdido', 'Marcado como perdido')}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTurnoSeleccionado(turno);
                              setModalReasignar(true);
                            }}
                          >
                            <CalendarClock className="h-4 w-4 text-blue-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalle del Turno */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Turno</DialogTitle>
            <DialogDescription>
              Información completa del turno {turnoSeleccionado?.numero}
            </DialogDescription>
          </DialogHeader>
          
          {turnoSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-sm">{turnoSeleccionado.cliente.nombre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Documento</Label>
                  <p className="text-sm">{turnoSeleccionado.cliente.documento}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Teléfono</Label>
                  <p className="text-sm">{turnoSeleccionado.cliente.telefono || 'No registrado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">{getEstadoBadge(turnoSeleccionado.estado)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sucursal</Label>
                  <p className="text-sm">{turnoSeleccionado.sucursal}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Kiosko</Label>
                  <p className="text-sm">{turnoSeleccionado.kiosko}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoría</Label>
                  <p className="text-sm">{turnoSeleccionado.categoria}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tiempo Espera</Label>
                  <p className="text-sm">{turnoSeleccionado.tiempoEspera} minutos</p>
                </div>
              </div>

              {turnoSeleccionado.observaciones && (
                <div>
                  <Label className="text-sm font-medium">Observaciones</Label>
                  <p className="text-sm bg-muted p-2 rounded">{turnoSeleccionado.observaciones}</p>
                </div>
              )}

              {turnoSeleccionado.fechaCita && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Cita Programada</Label>
                  <p className="text-sm">{turnoSeleccionado.fechaCita} a las {turnoSeleccionado.horaCita}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Reasignación */}
      <Dialog open={modalReasignar} onOpenChange={setModalReasignar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Turno</DialogTitle>
            <DialogDescription>
              Reagenda el turno {turnoSeleccionado?.numero}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nuevaFecha">Nueva Fecha</Label>
                <Input id="nuevaFecha" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nuevaHora">Nueva Hora</Label>
                <Input id="nuevaHora" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacionesReagendar">Motivo del Reagendamiento</Label>
              <Textarea 
                id="observacionesReagendar" 
                placeholder="Describe el motivo del reagendamiento..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalReasignar(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                if (turnoSeleccionado) {
                  cambiarEstadoTurno(turnoSeleccionado.id, 'reagendado', 'Reagendado por el administrador');
                  setModalReasignar(false);
                }
              }}>
                Reagendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Turnos;