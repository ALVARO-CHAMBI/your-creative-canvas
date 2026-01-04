import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Loader2 } from 'lucide-react';
import { ApiError } from '@/types';

const COUNTRY_CODES = [
  { code: '+591', country: 'Bolivia' },
  { code: '+54', country: 'Argentina' },
  { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' },
  { code: '+593', country: 'Ecuador' },
  { code: '+51', country: 'Perú' },
  { code: '+598', country: 'Uruguay' },
  { code: '+58', country: 'Venezuela' },
  { code: '+52', country: 'México' },
  { code: '+34', country: 'España' },
  { code: '+1', country: 'Estados Unidos' },
];

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  codigo_pais: z.string().min(1, 'Selecciona un código de país'),
  telefono: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos').regex(/^\d+$/, 'Solo números'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      codigo_pais: '+591',
    },
  });

  const codigoPais = watch('codigo_pais');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await registerUser({
        email: data.email,
        password: data.password,
        nombres: data.nombres,
        apellidos: data.apellidos,
        codigo_pais: data.codigo_pais,
        telefono: data.telefono,
      });
      toast({
        title: 'Registro exitoso',
        description: 'Te hemos enviado un código de verificación por WhatsApp.',
      });
      navigate('/verify', { state: { telefono: response.telefono } });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al registrarse',
        description: apiError.message || 'No se pudo completar el registro',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate para empezar a practicar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  placeholder="Juan"
                  {...register('nombres')}
                  disabled={isLoading}
                />
                {errors.nombres && (
                  <p className="text-sm text-destructive">{errors.nombres.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  placeholder="Pérez"
                  {...register('apellidos')}
                  disabled={isLoading}
                />
                {errors.apellidos && (
                  <p className="text-sm text-destructive">{errors.apellidos.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Teléfono (WhatsApp)</Label>
              <div className="flex gap-2">
                <Select
                  value={codigoPais}
                  onValueChange={(value) => setValue('codigo_pais', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Código" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} {c.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="70012345"
                  {...register('telefono')}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
              {errors.codigo_pais && (
                <p className="text-sm text-destructive">{errors.codigo_pais.message}</p>
              )}
              {errors.telefono && (
                <p className="text-sm text-destructive">{errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrarse
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
