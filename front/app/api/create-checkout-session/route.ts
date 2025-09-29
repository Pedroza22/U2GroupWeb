import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Tasas de cambio para convertir USD a otras monedas
const exchangeRates: Record<string, number> = {
  'usd': 1,
  'cad': 1.35,
  'mxn': 17.5,
  'ars': 350,
  'brl': 4.95,
  'clp': 950,
  'cop': 3900,
  'pen': 3.7,
  'ves': 35.5,
  'uyu': 39.5,
  'pyg': 7300,
  'bob': 6.9,
  'gyd': 209,
  'srd': 37.5,
};

// Verificar que la clave de Stripe esté configurada
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY no está configurada');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Verificar que la clave de Stripe esté configurada
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración de Stripe no encontrada' },
        { status: 500 }
      );
    }

    const { items, total, currency = 'usd' } = await request.json();

    // Validar los datos de entrada
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron elementos para el carrito' },
        { status: 400 }
      );
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: 'Total inválido' },
        { status: 400 }
      );
    }

    // Validar que el monto mínimo sea al menos 50 centavos USD
    // El total ya viene en USD desde el frontend
    const totalInUSD = total;
    
    console.log('💰 Validación de monto mínimo:', {
      total,
      currency,
      exchangeRate: exchangeRates[currency] || 1,
      totalInUSD,
      minimumRequired: 0.50
    });
    
    if (totalInUSD < 0.50) {
      console.log('❌ Monto insuficiente:', { totalInUSD, minimumRequired: 0.50 });
      return NextResponse.json(
        { error: 'El monto mínimo para el pago es $0.50 USD' },
        { status: 400 }
      );
    }
    
    console.log('✅ Monto válido para el pago');
    console.log('Creando sesión de Stripe con:', { items, total, currency });

    // Crear orden en el backend de Django primero
    try {
      console.log('📦 Creando orden en el backend de Django...');
      
      // Obtener el token de autenticación del usuario
      const authToken = request.headers.get('authorization') || 
                       request.cookies.get('token')?.value ||
                       request.nextUrl.searchParams.get('token');
      
      if (!authToken) {
        console.log('❌ No se encontró token de autenticación');
        return NextResponse.json(
          { error: 'Autenticación requerida' },
          { status: 401 }
        );
      }

      // Crear la orden en Django
      const djangoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/admin/cart/checkout/`, {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          total: total,
          currency: currency
        }),
      });

      if (!djangoResponse.ok) {
        console.log('❌ Error creando orden en Django:', await djangoResponse.text());
        return NextResponse.json(
          { error: 'Error creando orden en el backend' },
          { status: 500 }
        );
      }

      const orderData = await djangoResponse.json();
      console.log('✅ Orden creada en Django:', orderData);

      // Crear la sesión de checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'usd', // Usar USD como moneda base para Stripe
            product_data: {
              name: item.name || 'Plano Arquitectónico',
              images: item.image ? [item.image] : [],
              description: `Plano arquitectónico - ${item.name || 'Producto'}`,
            },
            unit_amount: Math.round((item.price || 0) * 100), // El precio ya viene en USD desde el frontend
          },
          quantity: item.quantity || 1,
        })),
        mode: 'payment',
        success_url: `${request.nextUrl.origin}/marketplace/cart/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.nextUrl.origin}/cart`,
        metadata: {
          total: total.toString(),
          item_count: items.length.toString(),
        },
        // Configuración para aceptar pagos de múltiples países pero en USD
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
        // Permitir países de América Latina y España
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'MX', 'ES', 'AR', 'BR', 'CL', 'CO', 'PE', 'VE', 'EC', 'UY', 'PY', 'BO', 'GY', 'SR', 'GF'],
        },
        // Configuración de impuestos (opcional)
        automatic_tax: {
          enabled: false, // Deshabilitado para simplificar
        },
      });

      console.log('Sesión de Stripe creada exitosamente:', session.id);

      return NextResponse.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Proporcionar más detalles del error
      let errorMessage = 'Error al crear la sesión de pago';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Proporcionar más detalles del error
    let errorMessage = 'Error al crear la sesión de pago';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
