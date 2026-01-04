import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { FinalizarSimulacroResponse, Simulacro, ApiError } from '@/types';
import { Trophy, CheckCircle, XCircle, MinusCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SimulacroResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [result, setResult] = useState<FinalizarSimulacroResponse | null>(
    location.state?.result || null
  );
  const [isLoading, setIsLoading] = useState(!result);

  useEffect(() => {
    if (!result) {
      loadResult();
    }
  }, [id, result]);

  const loadResult = async () => {
    try {
      const data = await api.get<FinalizarSimulacroResponse>(`/simulacros/${id}/resultado`);
      setResult(data);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al cargar resultados',
        description: apiError.message,
        variant: 'destructive',
      });
      navigate('/simulacros');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { simulacro, puntaje, correctas, incorrectas, sinResponder } = result;
  const total = correctas + incorrectas + sinResponder;
  const percentage = Math.round((correctas / total) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/simulacros')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Resultados</h1>
          <p className="text-muted-foreground">{simulacro.componente?.nombre}</p>
        </div>
      </div>

      {/* Score Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-warning" />
          </div>
          <div className="text-5xl font-bold text-primary mb-2">
            {puntaje}
          </div>
          <p className="text-muted-foreground">puntos obtenidos</p>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="font-medium">{correctas}</span>
              <span className="text-sm text-muted-foreground">correctas</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="font-medium">{incorrectas}</span>
              <span className="text-sm text-muted-foreground">incorrectas</span>
            </div>
            {sinResponder > 0 && (
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{sinResponder}</span>
                <span className="text-sm text-muted-foreground">sin responder</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => navigate('/simulacros')} className="flex-1">
          <RotateCcw className="mr-2 h-4 w-4" />
          Nuevo Simulacro
        </Button>
        <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
          Volver al Inicio
        </Button>
      </div>

      {/* Detailed Review */}
      <Card>
        <CardHeader>
          <CardTitle>Revisión Detallada</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {simulacro.respuestas?.map((respuesta, index) => {
              const pregunta = respuesta.pregunta;
              if (!pregunta) return null;

              const esCorrecta = respuesta.esCorrecta;
              const opcionCorrecta = pregunta.opciones.find((o) => o.esCorrecta);

              return (
                <AccordionItem key={respuesta.id} value={respuesta.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      {esCorrecta === true ? (
                        <CheckCircle className="h-5 w-5 text-success shrink-0" />
                      ) : esCorrecta === false ? (
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      ) : (
                        <MinusCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span className="line-clamp-1">{pregunta.enunciado}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      {pregunta.opciones.map((opcion) => {
                        const isSelected = respuesta.opcionSeleccionadaId === opcion.id;
                        const isCorrect = opcion.esCorrecta;

                        return (
                          <div
                            key={opcion.id}
                            className={cn(
                              'flex items-center gap-2 p-3 rounded-lg border',
                              isCorrect && 'bg-success/10 border-success/30',
                              isSelected && !isCorrect && 'bg-destructive/10 border-destructive/30'
                            )}
                          >
                            <span className="font-medium">{opcion.letra}.</span>
                            <span className="flex-1">{opcion.texto}</span>
                            {isCorrect && (
                              <Badge variant="default" className="bg-success">
                                Correcta
                              </Badge>
                            )}
                            {isSelected && !isCorrect && (
                              <Badge variant="destructive">Tu respuesta</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {pregunta.sustento && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Sustento:</p>
                        <p className="text-sm text-muted-foreground">{pregunta.sustento}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
