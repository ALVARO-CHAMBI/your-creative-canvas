import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Simulacro, Pregunta, ApiError, FinalizarSimulacroResponse } from '@/types';
import { ChevronLeft, ChevronRight, CheckCircle, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SimulacroExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [simulacro, setSimulacro] = useState<Simulacro | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSimulacro();
  }, [id]);

  const loadSimulacro = async () => {
    try {
      const data = await api.get<{ simulacro: Simulacro; preguntas: Pregunta[] }>(`/simulacros/${id}`);
      setSimulacro(data.simulacro);
      setPreguntas(data.preguntas);
      
      // Load existing answers
      if (data.simulacro.respuestas) {
        const existingAnswers: Record<string, string> = {};
        data.simulacro.respuestas.forEach((r) => {
          if (r.opcionSeleccionadaId) {
            existingAnswers[r.preguntaId] = r.opcionSeleccionadaId;
          }
        });
        setRespuestas(existingAnswers);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al cargar simulacro',
        description: apiError.message,
        variant: 'destructive',
      });
      navigate('/simulacros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (opcionId: string) => {
    const pregunta = preguntas[currentIndex];
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: opcionId }));

    try {
      await api.post(`/simulacros/${id}/responder/${pregunta.id}`, { opcionId });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const result = await api.post<FinalizarSimulacroResponse>(`/simulacros/${id}/finalizar`);
      navigate(`/simulacros/${id}/resultado`, { state: { result } });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al finalizar',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!simulacro || preguntas.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No se encontraron preguntas para este simulacro</p>
      </div>
    );
  }

  const currentPregunta = preguntas[currentIndex];
  const isComprensionLectora = simulacro.componente?.nombre === 'Comprensión Lectora';
  const progress = ((currentIndex + 1) / preguntas.length) * 100;
  const answeredCount = Object.keys(respuestas).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{simulacro.componente?.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            Pregunta {currentIndex + 1} de {preguntas.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {answeredCount}/{preguntas.length} respondidas
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Flag className="mr-2 h-4 w-4" />
                Finalizar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Finalizar simulacro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Has respondido {answeredCount} de {preguntas.length} preguntas.
                  {answeredCount < preguntas.length && ' Las preguntas sin responder se contarán como incorrectas.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continuar</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinish} disabled={isSubmitting}>
                  {isSubmitting ? 'Finalizando...' : 'Finalizar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question Navigator */}
      <div className="flex gap-1 flex-wrap">
        {preguntas.map((p, i) => (
          <Button
            key={p.id}
            variant={currentIndex === i ? 'default' : respuestas[p.id] ? 'secondary' : 'outline'}
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => setCurrentIndex(i)}
          >
            {i + 1}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className={cn('grid gap-4', isComprensionLectora && 'lg:grid-cols-2')}>
        {/* Article (for Comprensión Lectora) */}
        {isComprensionLectora && currentPregunta.articuloId && (
          <Card className="lg:max-h-[60vh]">
            <CardHeader>
              <CardTitle className="text-base">Texto de Lectura</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[40vh] lg:h-[50vh]">
                <div className="prose prose-sm max-w-none">
                  {/* Article content would be loaded here */}
                  <p className="text-muted-foreground text-sm">
                    [Contenido del artículo se mostraría aquí]
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal leading-relaxed">
              {currentPregunta.enunciado}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={respuestas[currentPregunta.id] || ''}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentPregunta.opciones.map((opcion) => (
                <div
                  key={opcion.id}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors',
                    respuestas[currentPregunta.id] === opcion.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  )}
                  onClick={() => handleAnswer(opcion.id)}
                >
                  <RadioGroupItem value={opcion.id} id={opcion.id} />
                  <Label htmlFor={opcion.id} className="flex-1 cursor-pointer font-normal">
                    <span className="font-medium mr-2">{opcion.letra}.</span>
                    {opcion.texto}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        {currentIndex === preguntas.length - 1 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalizar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Finalizar simulacro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Has respondido {answeredCount} de {preguntas.length} preguntas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Revisar respuestas</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinish} disabled={isSubmitting}>
                  Finalizar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button onClick={() => setCurrentIndex((i) => Math.min(preguntas.length - 1, i + 1))}>
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
