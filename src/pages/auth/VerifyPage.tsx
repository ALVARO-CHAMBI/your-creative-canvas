import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Loader2, MessageCircle } from 'lucide-react';
import { ApiError } from '@/types';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const telefono = location.state?.telefono;

  useEffect(() => {
    if (!telefono) {
      navigate('/register');
    }
  }, [telefono, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      toast({
        title: 'Código incompleto',
        description: 'Por favor ingresa el código de 6 dígitos',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ telefono, codigo: otp });
      toast({
        title: '¡Verificación exitosa!',
        description: 'Tu cuenta ha sido verificada correctamente.',
      });
      navigate('/');
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error de verificación',
        description: apiError.message || 'El código es incorrecto o ha expirado',
        variant: 'destructive',
      });
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOtp(telefono);
      toast({
        title: 'Código reenviado',
        description: 'Te hemos enviado un nuevo código por WhatsApp.',
      });
      setCountdown(RESEND_COOLDOWN);
      setCanResend(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error al reenviar',
        description: apiError.message || 'No se pudo reenviar el código',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!telefono) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <MessageCircle className="h-6 w-6 text-success" />
          </div>
          <CardTitle className="text-2xl font-semibold">Verifica tu WhatsApp</CardTitle>
          <CardDescription>
            Ingresa el código de 6 dígitos que enviamos al{' '}
            <span className="font-medium text-foreground">{telefono}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={OTP_LENGTH}
            disabled={isLoading}
          >
            <InputOTPGroup>
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <div className="text-center text-sm text-muted-foreground">
            {canResend ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reenviar código
              </Button>
            ) : (
              <p>
                Reenviar código en{' '}
                <span className="font-medium text-foreground">{countdown}s</span>
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={isLoading || otp.length !== OTP_LENGTH}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verificar
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/register')}
          >
            Volver al registro
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
