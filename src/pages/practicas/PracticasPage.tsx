import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  Componente,
  Articulo,
  TemaRazonamiento,
  TemaGeneral,
  TemaSocioemocional,
  Practica,
  ApiError,
  IniciarPracticaRequest,
} from '@/types';
import { BookOpen, Brain, Lightbulb, Heart, Play, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const componentTabs = [
  { id: 'comprension', nombre: 'Comprensión Lectora', icon: BookOpen },
  { id: 'razonamiento', nombre: 'Razonamiento Lógico', icon: Brain },
  { id: 'conocimientos', nombre: 'Conocimientos Generales', icon: Lightbulb },
  { id: 'habilidades', nombre: 'Habilidades Socioemocionales', icon: Heart },
];

export default function PracticasPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [temasRazonamiento, setTemasRazonamiento] = useState<TemaRazonamiento[]>([]);
  const [temasGenerales, setTemasGenerales] = useState<TemaGeneral[]>([]);
  const [temasSocioemocionales, setTemasSocioemocionales] = useState<TemaSocioemocional[]>([]);
  const [historial, setHistorial] = useState<Practica[]>([]);
  
  const [activeTab, setActiveTab] = useState('nuevo');
  const [selectedComponente, setSelectedComponente] = useState('comprension');
  const [selectedArticulo, setSelectedArticulo] = useState<string>('');
  const [selectedTema, setSelectedTema] = useState<string>('');
  const [selectedSubtema, setSelectedSubtema] = useState<string>('');
  const [soloPractica, setSoloPractica] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [componentesData, articulosData, temasRazData, temasGenData, temasSocData, historialData] = await Promise.all([
        api.get<Componente[]>('/componentes'),
        api.get<Articulo[]>('/articulos'),
        api.get<TemaRazonamiento[]>('/temas-razonamiento'),
        api.get<TemaGeneral[]>('/temas-generales'),
        api.get<TemaSocioemocional[]>('/temas-socioemocionales'),
        api.get<Practica[]>('/practicas/historial'),
      ]);
      setComponentes(componentesData);
      setArticulos(articulosData);
      setTemasRazonamiento(temasRazData);
      setTemasGenerales(temasGenData);
      setTemasSocioemocionales(temasSocData);
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

  const getComponenteId = (tabId: string) => {
    const nombreMap: Record<string, string> = {
      comprension: 'Comprensión Lectora',
      razonamiento: 'Razonamiento Lógico',
      conocimientos: 'Conocimientos Generales',
      habilidades: 'Habilidades Socioemocionales',
    };
    return componentes.find((c) => c.nombre === nombreMap[tabId])?.id || '';
  };

  const startPractica = async () => {
    const componenteId = getComponenteId(selectedComponente);
    if (!componenteId) {
      toast({
        title: 'Error',
        description: 'Selecciona un componente válido',
        variant: 'destructive',
      });
      return;
    }

    const request: IniciarPracticaRequest = {
      componenteId,
      soloPractica,
    };

    if (selectedComponente === 'comprension' && selectedArticulo) {
      request.articuloId = selectedArticulo;
    } else if (selectedComponente === 'razonamiento') {
      if (selectedSubtema) {
        request.subtemaId = selectedSubtema;
      } else if (selectedTema) {
        request.temaRazonamientoId = selectedTema;
      }
    } else if (selectedComponente === 'conocimientos' && selectedTema) {
      request.temaGeneralId = selectedTema;
    } else if (selectedComponente === 'habilidades' && selectedTema) {
      request.temaSocioemocionalId = selectedTema;
    }

    setIsStarting(true);
    try {
      const practica = await api.post<Practica>('/practicas/iniciar', request);
      navigate(`/practicas/${practica.id}`);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al iniciar práctica',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setIsStarting(false);
    }
  };

  const renderComponenteSelector = () => {
    switch (selectedComponente) {
      case 'comprension':
        return (
          <div className="space-y-2">
            <Label>Artículo (opcional)</Label>
            <Select value={selectedArticulo} onValueChange={setSelectedArticulo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los artículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los artículos</SelectItem>
                {articulos.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'razonamiento':
        const selectedTemaRaz = temasRazonamiento.find((t) => t.id === selectedTema);
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tema (opcional)</Label>
              <Select
                value={selectedTema}
                onValueChange={(v) => {
                  setSelectedTema(v);
                  setSelectedSubtema('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los temas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los temas</SelectItem>
                  {temasRazonamiento.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemaRaz && selectedTemaRaz.subtemas && selectedTemaRaz.subtemas.length > 0 && (
              <div className="space-y-2">
                <Label>Subtema (opcional)</Label>
                <Select value={selectedSubtema} onValueChange={setSelectedSubtema}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los subtemas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los subtemas</SelectItem>
                    {selectedTemaRaz.subtemas.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 'conocimientos':
        return (
          <div className="space-y-2">
            <Label>Tema (opcional)</Label>
            <Select value={selectedTema} onValueChange={setSelectedTema}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los temas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los temas</SelectItem>
                {temasGenerales.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'habilidades':
        return (
          <div className="space-y-2">
            <Label>Tema (opcional)</Label>
            <Select value={selectedTema} onValueChange={setSelectedTema}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los temas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los temas</SelectItem>
                {temasSocioemocionales.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prácticas</h1>
        <p className="text-muted-foreground">Practica por temas específicos a tu ritmo</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="nuevo">Nueva Práctica</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="nuevo" className="mt-6 space-y-6">
          {/* Component Selector */}
          <div className="flex gap-2 flex-wrap">
            {componentTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={selectedComponente === tab.id ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedComponente(tab.id);
                  setSelectedArticulo('');
                  setSelectedTema('');
                  setSelectedSubtema('');
                }}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.nombre}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurar Práctica</CardTitle>
              <CardDescription>
                Selecciona los filtros para tu sesión de práctica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderComponenteSelector()}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="soloPractica"
                  checked={soloPractica}
                  onCheckedChange={(checked) => setSoloPractica(checked as boolean)}
                />
                <Label htmlFor="soloPractica" className="cursor-pointer">
                  Solo preguntas de práctica (más fáciles)
                </Label>
              </div>

              <Button onClick={startPractica} disabled={isStarting} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                {isStarting ? 'Iniciando...' : 'Iniciar Práctica'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          {historial.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Aún no has realizado ninguna práctica</p>
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
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historial.map((practica) => (
                    <TableRow key={practica.id}>
                      <TableCell>
                        {format(new Date(practica.fechaInicio), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>{practica.componente?.nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-warning" />
                          {practica.puntaje ?? '--'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={practica.completado ? 'default' : 'secondary'}>
                          {practica.completado ? 'Completado' : 'En progreso'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/practicas/${practica.id}`)}
                        >
                          {practica.completado ? 'Ver detalle' : 'Continuar'}
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
