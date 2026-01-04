import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Target, BarChart3, TrendingUp, BookOpen, Brain, Lightbulb, Heart } from 'lucide-react';

const componentCards = [
  {
    id: 'comprension',
    title: 'Comprensión Lectora',
    description: 'Analiza textos y responde preguntas',
    icon: BookOpen,
    color: 'bg-component-comprension/10 text-component-comprension',
    borderColor: 'border-component-comprension/20',
  },
  {
    id: 'razonamiento',
    title: 'Razonamiento Lógico',
    description: 'Resuelve problemas de lógica',
    icon: Brain,
    color: 'bg-component-razonamiento/10 text-component-razonamiento',
    borderColor: 'border-component-razonamiento/20',
  },
  {
    id: 'conocimientos',
    title: 'Conocimientos Generales',
    description: 'Demuestra tu cultura general',
    icon: Lightbulb,
    color: 'bg-component-conocimientos/10 text-component-conocimientos',
    borderColor: 'border-component-conocimientos/20',
  },
  {
    id: 'habilidades',
    title: 'Habilidades Socioemocionales',
    description: 'Desarrolla tus soft skills',
    icon: Heart,
    color: 'bg-component-habilidades/10 text-component-habilidades',
    borderColor: 'border-component-habilidades/20',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          ¡Hola, {user?.nombres}!
        </h1>
        <p className="text-muted-foreground">
          Continúa practicando para mejorar tu puntaje
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Simulacros</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prácticas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">puntos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Racha</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">días consecutivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Simulacro</CardTitle>
            <CardDescription>
              Pon a prueba tus conocimientos con un examen completo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/simulacros">
                <FileText className="mr-2 h-4 w-4" />
                Ir a Simulacros
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modo Práctica</CardTitle>
            <CardDescription>
              Practica por temas específicos a tu ritmo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/practicas">
                <Target className="mr-2 h-4 w-4" />
                Ir a Prácticas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Components Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Componentes de Evaluación</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {componentCards.map((component) => (
            <Card
              key={component.id}
              className={`border-2 ${component.borderColor} hover:shadow-md transition-shadow`}
            >
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-lg ${component.color} flex items-center justify-center mb-2`}>
                  <component.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{component.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {component.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
