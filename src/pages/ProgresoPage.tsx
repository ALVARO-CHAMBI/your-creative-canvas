import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { EstadisticasDetalladas, ApiError } from '@/types';
import { TrendingUp, Target, Trophy, Flame, BookOpen, Brain, Lightbulb, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const componentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Comprensión Lectora': BookOpen,
  'Razonamiento Lógico': Brain,
  'Conocimientos Generales': Lightbulb,
  'Habilidades Socioemocionales': Heart,
};

export default function ProgresoPage() {
  const { toast } = useToast();
  const [estadisticas, setEstadisticas] = useState<EstadisticasDetalladas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    try {
      const data = await api.get<EstadisticasDetalladas>('/estadisticas/usuario');
      setEstadisticas(data);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al cargar estadísticas',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { generales, porComponente, evolucion } = estadisticas || {
    generales: { totalSimulacros: 0, totalPracticas: 0, promedioGeneral: 0, rachaActual: 0, mejorRacha: 0 },
    porComponente: [],
    evolucion: [],
  };

  const radarData = porComponente.map((c) => ({
    subject: c.componenteNombre.split(' ')[0],
    value: c.promedio,
    fullMark: 100,
  }));

  const evolutionData = evolucion.map((e) => ({
    fecha: format(new Date(e.fecha), 'dd/MM', { locale: es }),
    puntaje: e.puntaje,
    tipo: e.tipo,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi Progreso</h1>
        <p className="text-muted-foreground">Revisa tu rendimiento y estadísticas</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Simulacros</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generales.totalSimulacros}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Prácticas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generales.totalPracticas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generales.promedioGeneral.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <Flame className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generales.rachaActual}</div>
            <p className="text-xs text-muted-foreground">Mejor: {generales.mejorRacha} días</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="componentes">
        <TabsList>
          <TabsTrigger value="componentes">Por Componente</TabsTrigger>
          <TabsTrigger value="evolucion">Evolución</TabsTrigger>
        </TabsList>

        <TabsContent value="componentes" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Radar Chart */}
            {radarData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento por Componente</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Promedio"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Component Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Detalle por Componente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {porComponente.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aún no hay datos disponibles
                  </p>
                ) : (
                  porComponente.map((comp) => {
                    const Icon = componentIcons[comp.componenteNombre] || BookOpen;
                    return (
                      <div key={comp.componenteId} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{comp.componenteNombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {comp.totalIntentos} intentos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{comp.promedio.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">
                            Mejor: {comp.mejorPuntaje}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evolucion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Puntajes</CardTitle>
              <CardDescription>Tu progreso a lo largo del tiempo</CardDescription>
            </CardHeader>
            <CardContent>
              {evolutionData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Aún no hay datos suficientes para mostrar la evolución
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="puntaje"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
