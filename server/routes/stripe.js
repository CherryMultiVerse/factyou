import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
}

// Initialize Stripe with proper error handling
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      timeout: 20000, // 20 second timeout
      maxNetworkRetries: 3, // Retry failed requests
    });
    console.log('✅ Stripe initialized successfully');
  } else {
    console.error('❌ Cannot initialize Stripe: STRIPE_SECRET_KEY is missing');
  }
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error.message);
}

// Create checkout session (no authentication required)
router.post('/create-checkout', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { price_id, mode, success_url, cancel_url } = req.body;

    console.log('🎯 Stripe checkout request received:', {
      price_id,
      mode,
      success_url: success_url?.substring(0, 50) + '...',
      cancel_url: cancel_url?.substring(0, 50) + '...',
      stripe_configured: !!process.env.STRIPE_SECRET_KEY,
      stripe_initialized: !!stripe,
      timestamp: new Date().toISOString()
    });

    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('❌ Stripe not initialized - check STRIPE_SECRET_KEY environment variable');
      return res.status(500).json({
        error: 'Payment system not configured',
        details: 'Stripe is not properly initialized on the server'
      });
    }

    // Validate required parameters
    if (!price_id || !mode || !success_url || !cancel_url) {
      console.error('❌ Missing required parameters:', {
        price_id: !!price_id,
        mode: !!mode,
        success_url: !!success_url,
        cancel_url: !!cancel_url
      });
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'price_id, mode, success_url, and cancel_url are all required'
      });
    }

    // Validate mode
    if (!['payment', 'subscription'].includes(mode)) {
      console.error('❌ Invalid mode:', mode);
      return res.status(400).json({
        error: 'Invalid mode',
        details: 'Mode must be either "payment" or "subscription"'
      });
    }

    console.log('🎯 Creating Stripe checkout session...');
    console.log('   Using API key:', process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...');
    console.log('   Price ID:', price_id);
    console.log('   Mode:', mode);

    // Create checkout session with timeout handling
    const sessionPromise = stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: success_url,
      cancel_url: cancel_url,
      // Optional: collect customer email for receipt
      customer_creation: 'if_required',
      // Allow promotion codes
      allow_promotion_codes: true,
      // Set billing address collection
      billing_address_collection: 'auto',
      // Add metadata for tracking
      metadata: {
        source: 'factyou_donation',
        timestamp: new Date().toISOString(),
        price_id: price_id
      }
    });

    // Add timeout to the Stripe request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Stripe request timed out')), 15000);
    });

    const session = await Promise.race([sessionPromise, timeoutPromise]);

    const duration = Date.now() - startTime;
    console.log('✅ Checkout session created successfully in', duration + 'ms:', {
      sessionId: session.id,
      url: session.url?.substring(0, 50) + '...',
      mode: session.mode,
      payment_status: session.payment_status
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      created: session.created,
      mode: session.mode
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Stripe checkout error after', duration + 'ms:', {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      param: error?.param,
      statusCode: error?.statusCode,
      requestId: error?.requestId
    });
    
    // Provide more specific error messages
    let userMessage = 'Failed to create checkout session';
    let statusCode = 500;
    
    if (error?.type === 'StripeAuthenticationError') {
      userMessage = 'Payment system authentication failed';
      statusCode = 401;
      console.error('❌ Stripe Authentication Error - check API key validity');
    } else if (error?.type === 'StripeInvalidRequestError') {
      userMessage = 'Invalid payment request';
      statusCode = 400;
      if (error?.param) {
        userMessage += `: ${error.param}`;
      }
    } else if (error?.code === 'price_not_found') {
      userMessage = 'Payment option not found';
      statusCode = 400;
    } else if (error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
      userMessage = 'Payment service timed out. Please try again.';
      statusCode = 408;
    } else if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      userMessage = 'Cannot connect to payment service';
      statusCode = 503;
    }
    
    res.status(statusCode).json({
      error: userMessage,
      details: error?.message,
      type: error?.type,
      code: error?.code,
      requestId: error?.requestId
    });
  }
});

// Webhook endpoint for Stripe events (simplified for donations)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('🎯 Stripe webhook received:', {
    signature: !!sig,
    secret_configured: !!webhookSecret,
    body_size: req.body?.length,
    timestamp: new Date().toISOString()
  });

  if (!webhookSecret) {
    console.error('❌ Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  if (!stripe) {
    console.error('❌ Stripe not initialized for webhook processing');
    return res.status(500).send('Stripe not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Donation completed:', {
          sessionId: session.id,
          amount: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email,
          mode: session.mode
        });
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('✅ Payment succeeded:', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('❌ Payment failed:', {
          paymentIntentId: failedPayment.id,
          lastPaymentError: failedPayment.last_payment_error
        });
        break;
        
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (webhookError) {
    console.error('❌ Error processing webhook:', webhookError);
  }

  res.json({ received: true });
});

// Test endpoint to verify Stripe configuration
router.get('/test', (req, res) => {
  const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
  const keyPreview = process.env.STRIPE_SECRET_KEY ? 
    process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...' : 
    'Not set';
    
  const testResult = {
    stripe_configured: hasSecretKey,
    stripe_initialized: !!stripe,
    webhook_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
    key_preview: keyPreview,
    key_type: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 
              process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'unknown',
    timestamp: new Date().toISOString(),
    env_vars: Object.keys(process.env).filter(key => key.includes('STRIPE')),
    server_time: new Date().toISOString()
  };
  
  console.log('🧪 Stripe test endpoint called:', testResult);
  
  res.json(testResult);
});

// Health check endpoint specifically for Stripe
router.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    stripe: {
      configured: !!process.env.STRIPE_SECRET_KEY,
      initialized: !!stripe,
      webhook_configured: !!process.env.STRIPE_WEBHOOK_SECRET
    },
    timestamp: new Date().toISOString()
  };
  
  const statusCode = health.stripe.configured && health.stripe.initialized ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;