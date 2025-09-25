'use client';

import { useState, useEffect } from 'react';
import { STRIPE_CONFIG } from '@/lib/stripe-config';
import { getStripe } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripeCheckoutProps {
  amount: number;
  currency?: string;
  productName: string;
  orderId: string;
  customerEmail: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function StripeCheckout({
  amount,
  currency = 'usd',
  productName,
  orderId,
  customerEmail,
  onSuccess,
  onError
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [checkout, setCheckout] = useState<any>(null);
  const [email, setEmail] = useState(customerEmail);
  const [emailError, setEmailError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const { toast } = useToast();

  // Cargar Stripe
  const stripePromise = getStripe();

  useEffect(() => {
    initializeCheckout();
  }, []);

  const initializeCheckout = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe no se pudo cargar');
      }

      // Crear checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_items: [{
            price_data: {
              currency: currency,
              product_data: { name: productName },
              unit_amount: Math.round(amount * 100)
            },
            quantity: 1
          }],
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`,
          customer_email: email
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear checkout session');
      }

      const { clientSecret } = await response.json();

      // Inicializar checkout
      const checkoutInstance = await stripe.initCheckout({
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      });

      setCheckout(checkoutInstance);

      // Configurar elementos
      const paymentElement = checkoutInstance.createPaymentElement();
      const billingAddressElement = checkoutInstance.createBillingAddressElement();

      // Montar elementos (esto se hará en el render)
      setTimeout(() => {
        const paymentContainer = document.getElementById('payment-element');
        const billingContainer = document.getElementById('billing-address-element');
        
        if (paymentContainer && billingContainer) {
          paymentElement.mount('#payment-element');
          billingAddressElement.mount('#billing-address-element');
        }
      }, 100);

    } catch (error) {
      console.error('Error inicializando checkout:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const validateEmail = async (email: string) => {
    if (!checkout) return { isValid: false, message: 'Checkout no inicializado' };
    
    try {
      const updateResult = await checkout.updateEmail(email);
      const isValid = updateResult.type !== 'error';
      return { isValid, message: !isValid ? updateResult.error.message : null };
    } catch (error) {
      return { isValid: false, message: 'Error validando email' };
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError('');
  };

  const handleEmailBlur = async () => {
    if (!email) return;
    
    const { isValid, message } = await validateEmail(email);
    if (!isValid) {
      setEmailError(message || 'Email inválido');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Validar email
      const { isValid, message } = await validateEmail(email);
      if (!isValid) {
        setEmailError(message || 'Email inválido');
        setLoading(false);
        return;
      }

      // Confirmar pago
      const { error } = await checkout.confirm();

      if (error) {
        setErrorMessage(error.message);
        toast({
          title: "Error en el Pago",
          description: error.message,
          variant: "destructive",
        });
        onError?.(error.message);
      } else {
        setPaymentStatus('success');
        toast({
          title: "¡Pago Exitoso!",
          description: `Tu pago de $${amount} ha sido procesado correctamente.`,
        });
        onSuccess?.({ success: true });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(errorMsg);
      toast({
        title: "Error en el Pago",
        description: errorMsg,
        variant: "destructive",
      });
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            ¡Pago Exitoso!
          </CardTitle>
          <CardDescription>
            Tu transacción se ha completado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Detalles del Pago:</h3>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Producto:</span> {productName}</div>
              <div><span className="font-medium">Monto:</span> ${amount} {currency.toUpperCase()}</div>
              <div><span className="font-medium">Orden:</span> {orderId}</div>
            </div>
          </div>
          <Button 
            onClick={() => setPaymentStatus('idle')} 
            className="w-full"
            variant="outline"
          >
            Hacer Otro Pago
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Error en el Pago
          </CardTitle>
          <CardDescription>
            No se pudo procesar tu transacción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => setPaymentStatus('idle')} 
            variant="outline"
            className="w-full"
          >
            Intentar de Nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Checkout de Stripe
        </CardTitle>
        <CardDescription>
          Completa tu pago de forma segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              className={emailError ? 'border-red-500' : ''}
              placeholder="tu@email.com"
            />
            {emailError && (
              <div className="text-red-500 text-sm mt-1">{emailError}</div>
            )}
          </div>

          <div>
            <Label>Dirección de Facturación</Label>
            <div id="billing-address-element" className="mt-2">
              {/* Stripe montará el elemento aquí */}
            </div>
          </div>

          <div>
            <Label>Información de Pago</Label>
            <div id="payment-element" className="mt-2">
              {/* Stripe montará el elemento aquí */}
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading || !checkout}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar ${amount}
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            🔒 Tus datos están protegidos por Stripe. No almacenamos información de tarjetas.
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 