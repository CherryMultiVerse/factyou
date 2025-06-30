import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

// Set up Stripe with your secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  appInfo: {
    name: 'FactYou Donations',
    version: '1.0.0',
  },
});

// Basic CORS helper
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

// Minimal input validator
type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const key in expected) {
    const expectation = expected[key];
    const value = values[key];

    if (expectation === 'string') {
      if (typeof value !== 'string') return `Missing or invalid parameter: ${key}`;
    } else if (!expectation.values.includes(value)) {
      return `Invalid value for ${key}, must be one of ${expectation.values.join(', ')}`;
    }
  }

  return undefined;
}

// Serve function
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse({}, 204);
  }

  if (req.method !== 'POST') {
    return corsResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { price_id, success_url, cancel_url, mode } = await req.json();

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        price_id: 'string',
        success_url: 'string',
        cancel_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      }
    );

    if (error) return corsResponse({ error }, 400);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode,
      success_url,
      cancel_url,
    });

    console.log(`✅ Created checkout session: ${session.id}`);
    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('❌ Stripe error:', err.message);
    return corsResponse({ error: err.message }, 500);
  }
});