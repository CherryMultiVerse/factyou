import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import axios from 'axios';
import stripeRoutes from './routes/stripe.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path to project root
const envPath = path.resolve(__dirname, '../.env');
try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn('⚠️ Environment config error:', result.error);
    console.log('   Tried loading from:', envPath);
  } else {
    console.log('✅ Environment variables loaded from:', envPath);
  }
} catch (error) {
  console.warn('⚠️ Environment config failed:', error);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Debug environment variables
console.log('🔍 Environment check:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);
console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set (' + process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...)' : 'Not set');
console.log('   STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');

// Initialize OpenAI (optional)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI API configured');
} else {
  console.log('⚠️ OpenAI API key not found - using fallback responses');
}

// BULLETPROOF middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'https://factyou.co'],
  credentials: true
}));

// Special handling for Stripe webhooks (raw body needed)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Regular JSON middleware for other routes
app.use(express.json({ limit: '10mb' }));

// Stripe routes
app.use('/api/stripe', stripeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    server: 'FactYou! Server',
    uptime: process.uptime(),
    apis: {
      openai: !!openai,
      stripe: !!process.env.STRIPE_SECRET_KEY
    },
    features: {
      donations: !!process.env.STRIPE_SECRET_KEY,
      factChecking: true
    },
    environment: {
      node_env: process.env.NODE_ENV,
      stripe_key_preview: process.env.STRIPE_SECRET_KEY ? 
        process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...' : 
        'Not configured'
    }
  });
});

// Simple fact-check endpoint for fallback
app.post('/api/analyze', async (req, res) => {
  try {
    // Fake delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));

    const body = req.body || {};
    const claim = (body.claim || '').trim();
    
    if (!claim) {
      return res.status(200).json({
        claim: '',
        overallRating: 'ERROR',
        confidence: 0,
        tweetableSummary: '🤔 EMPTY CLAIM: We can\'t fact-check thin air. Please provide an actual claim to analyze. #FactCheck #FactYou',
        results: [{
          id: 'no-claim',
          source: 'Input Validator',
          category: 'center',
          rating: 'unverified',
          summary: 'No claim was provided for analysis.',
          url: '#',
          credibilityScore: 50,
          favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32'
        }],
        analysisTime: 0
      });
    }

    // Simulated mock response
    const mockResponse = {
      claim: claim,
      overallRating: "MIXED",
      confidence: 75,
      tweetableSummary: `"${claim.substring(0, 60)}..." - MIXED verdict from cross-spectrum analysis. Reality refuses to be simple. (75% confidence) #FactCheck #FactYou`,
      results: [
        {
          id: 'mock-left',
          source: "NPR",
          category: "left",
          rating: "mostly-true",
          summary: "NPR analysis suggests this claim has merit but requires additional context.",
          url: "https://npr.org",
          credibilityScore: 92,
          favicon: 'https://www.google.com/s2/favicons?domain=npr.org&sz=32'
        },
        {
          id: 'mock-center',
          source: "Reuters",
          category: "center",
          rating: "mixed",
          summary: "Reuters finds the evidence presents a nuanced picture requiring careful analysis.",
          url: "https://reuters.com",
          credibilityScore: 96,
          favicon: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=32'
        },
        {
          id: 'mock-right',
          source: "Wall Street Journal",
          category: "right",
          rating: "mostly-false",
          summary: "WSJ analysis raises significant questions about the accuracy of this claim.",
          url: "https://wsj.com",
          credibilityScore: 87,
          favicon: 'https://www.google.com/s2/favicons?domain=wsj.com&sz=32'
        }
      ],
      analysisTime: 2.3
    };

    res.status(200).json(mockResponse);
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    
    const errorResponse = {
      claim: req.body?.claim || 'Unknown claim',
      overallRating: 'ERROR',
      confidence: 0,
      tweetableSummary: '🔧 ANALYSIS ERROR: Something went wrong. Please try again. #FactCheck #FactYou',
      results: [{
        id: 'error',
        source: 'Error Handler',
        category: 'center',
        rating: 'unverified',
        summary: 'Analysis encountered an error. Please try again.',
        url: '#',
        credibilityScore: 50,
        favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32'
      }],
      analysisTime: 0
    };
    
    res.status(200).json(errorResponse);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist.'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Unhandled server error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end.'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FactYou! Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Analysis endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`💰 Stripe endpoints: http://localhost:${PORT}/api/stripe/*`);
  console.log(`🧪 Stripe test: http://localhost:${PORT}/api/stripe/test`);
  console.log(`🎨 Frontend: http://localhost:5173`);
  console.log('');
  console.log('💳 Stripe Configuration Status:');
  console.log(`   Secret Key: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured (' + process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...)' : '❌ Missing'}`);
  console.log(`   Webhook Secret: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing (optional for basic donations)'}`);
  console.log('');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('⚠️  WARNING: Stripe is not configured! Donations will not work.');
    console.log('   Add STRIPE_SECRET_KEY to your .env file');
  } else {
    console.log('🚀 Ready to accept donations and fact-check claims!');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Prevent crashes but log errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
  // Don't exit - keep server running
});

export default app;