import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Practica, Pregunta, ApiError } from '@/types';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Flag, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RespuestaFeedback {
  esCorrecta: boolean;
  opcionCorrectaId: string;
  sustento: string;
}

export default function PracticaExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [practica, setPractica] = useState<Practica | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, RespuestaFeedback>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    loadPractica();
  }, [id]);

  const loadPractica = async () => {
    try {
      const data = await api.get<{ practica: Practica; preguntas: Pregunta[] }>(`/practicas/${id}`);
      setPractica(data.practica);
      setPreguntas(data.preguntas);
      
      // Load existing answers
      if (data.practica.respuestas) {
        const existingAnswers: Record<string, string> = {};
        const existingFeedback: Record<string, RespuestaFeedback> = {};
        data.practica.respuestas.forEach((r) => {
          if (r.opcionSeleccionadaId) {
            existingAnswers[r.preguntaId] = r.opcionSeleccionadaId;
            const pregunta = data.preguntas.find((p) => p.id === r.preguntaId);
            const opcionCorrecta = pregunta?.opciones.find((o) => o.esCorrecta);
            if (pregunta && opcionCorrecta) {
              existingFeedback[r.preguntaId] = {
                esCorrecta: r.esCorrecta ?? false,
                opcionCorrectaId: opcionCorrecta.id,
                sustento: pregunta.sustento,
              };
            }
          }
        });
        setRespuestas(existingAnswers);
        setFeedback(existingFeedback);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al cargar práctica',
        description: apiError.message,
        variant: 'destructive',
      });
      navigate('/practicas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (opcionId: string) => {
    const pregunta = preguntas[currentIndex];
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: opcionId }));
    setShowFeedback(true);

    try {
      const response = await api.post<RespuestaFeedback>(
        `/practicas/${id}/responder/${pregunta.id}`,
        { opcionId }
      );
      setFeedback((prev) => ({ ...prev, [pregunta.id]: response }));
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/practicas/${id}/finalizar`);
      toast({
        title: '¡Práctica completada!',
        description: 'Has terminado tu sesión de práctica.',
      });
      navigate('/practicas');
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

  if (!practica || preguntas.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No se encontraron preguntas para esta práctica</p>
      </div>
    );
  }

  const currentPregunta = preguntas[currentIndex];
  const currentFeedback = feedback[currentPregunta.id];
  const hasAnswered = !!respuestas[currentPregunta.id];
  const progress = ((currentIndex + 1) / preguntas.length) * 100;
  const answeredCount = Object.keys(respuestas).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/practicas')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Modo Práctica</h1>
          <p className="text-sm text-muted-foreground">
            Pregunta {currentIndex + 1} de {preguntas.length}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Flag className="mr-2 h-4 w-4" />
              Terminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Terminar práctica?</AlertDialogTitle>
              <AlertDialogDescription>
                Has respondido {answeredCount} de {preguntas.length} preguntas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinish} disabled={isSubmitting}>
                Terminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal leading-relaxed">
            {currentPregunta.enunciado}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={respuestas[currentPregunta.id] || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
            disabled={hasAnswered}
          >
            {currentPregunta.opciones.map((opcion) => {
              const isSelected = respuestas[currentPregunta.id] === opcion.id;
              const isCorrect = currentFeedback?.opcionCorrectaId === opcion.id;
              const showResult = hasAnswered && showFeedback;

              return (
                <div
                  key={opcion.id}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg border p-4 transition-colors',
                    !hasAnswered && 'cursor-pointer hover:bg-muted/50',
                    showResult && isCorrect && 'border-success bg-success/10',
                    showResult && isSelected && !isCorrect && 'border-destructive bg-destructive/10'
                  )}
                  onClick={() => !hasAnswered && handleAnswer(opcion.id)}
                >
                  <RadioGroupItem value={opcion.id} id={opcion.id} />
                  <Label
                    htmlFor={opcion.id}
                    className={cn('flex-1 font-normal', !hasAnswered && 'cursor-pointer')}
                  >
                    <span className="font-medium mr-2">{opcion.letra}.</span>
                    {opcion.texto}
                  </Label>
                  {showResult && isCorrect && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              );
            })}
          </RadioGroup>

          {/* Feedback */}
          {hasAnswered && showFeedback && currentFeedback && (
            <div className="animate-slide-up">
              <div className={cn(
                'p-4 rounded-lg',
                currentFeedback.esCorrecta ? 'bg-success/10' : 'bg-destructive/10'
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {currentFeedback.esCorrecta ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="font-medium text-success">¡Correcto!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="font-medium text-destructive">Incorrecto</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{currentFeedback.sustento}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setShowFeedback(false);
            setCurrentIndex((i) => Math.max(0, i - 1));
          }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        {hasAnswered && showFeedback ? (
          currentIndex === preguntas.length - 1 ? (
            <Button onClick={handleFinish} disabled={isSubmitting}>
              Terminar Práctica
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )
        ) : (
          <div className="text-sm text-muted-foreground self-center">
            Selecciona una respuesta
          </div>
        )}
      </div>
    </div>
  );
}
