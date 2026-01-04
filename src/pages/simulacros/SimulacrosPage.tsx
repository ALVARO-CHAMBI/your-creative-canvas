import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Componente, Simulacro, ApiError } from '@/types';
import { BookOpen, Brain, Lightbulb, Heart, Play, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const componentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Comprensión Lectora': BookOpen,
  'Razonamiento Lógico': Brain,
  'Conocimientos Generales': Lightbulb,
  'Habilidades Socioemocionales': Heart,
};

const componentColors: Record<string, string> = {
  'Comprensión Lectora': 'bg-component-comprension/10 text-component-comprension border-component-comprension/20',
  'Razonamiento Lógico': 'bg-component-razonamiento/10 text-component-razonamiento border-component-razonamiento/20',
  'Conocimientos Generales': 'bg-component-conocimientos/10 text-component-conocimientos border-component-conocimientos/20',
  'Habilidades Socioemocionales': 'bg-component-habilidades/10 text-component-habilidades border-component-habilidades/20',
};

export default function SimulacrosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [historial, setHistorial] = useState<Simulacro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [componentesData, historialData] = await Promise.all([
        api.get<Componente[]>('/componentes'),
        api.get<Simulacro[]>('/simulacros/historial'),
      ]);
      setComponentes(componentesData);
      setHistorial(historialData);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al cargar datos',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startSimulacro = async (componenteId: string) => {
    setIsStarting(componenteId);
    try {
      const simulacro = await api.post<Simulacro>('/simulacros/iniciar', { componenteId });
      navigate(`/simulacros/${simulacro.id}`);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al iniciar simulacro',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setIsStarting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Simulacros</h1>
        <p className="text-muted-foreground">
          Selecciona un componente para iniciar tu simulacro
        </p>
      </div>

      <Tabs defaultValue="nuevo">
        <TabsList>
          <TabsTrigger value="nuevo">Nuevo Simulacro</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="nuevo" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {componentes.map((componente) => {
              const Icon = componentIcons[componente.nombre] || BookOpen;
              const colorClasses = componentColors[componente.nombre] || '';

              return (
                <Card
                  key={componente.id}
                  className={`border-2 hover:shadow-md transition-all cursor-pointer ${colorClasses.split(' ').slice(2).join(' ')}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses.split(' ').slice(0, 2).join(' ')}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="mt-4">{componente.nombre}</CardTitle>
                    <CardDescription>
                      {componente.descripcion || 'Evaluación completa del componente'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => startSimulacro(componente.id)}
                      disabled={isStarting === componente.id}
                      className="w-full"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isStarting === componente.id ? 'Iniciando...' : 'Iniciar Simulacro'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          {historial.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">
                  Aún no has realizado ningún simulacro
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Componente</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Tiempo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historial.map((simulacro) => (
                    <TableRow key={simulacro.id}>
                      <TableCell>
                        {format(new Date(simulacro.fechaInicio), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>{simulacro.componente?.nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-warning" />
                          {simulacro.puntaje ?? '--'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {simulacro.tiempoTotal ? `${Math.round(simulacro.tiempoTotal / 60)} min` : '--'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={simulacro.completado ? 'default' : 'secondary'}>
                          {simulacro.completado ? 'Completado' : 'En progreso'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/simulacros/${simulacro.id}/resultado`)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
