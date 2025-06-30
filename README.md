# FactYou! - AI-Powered Fact Checking

A production-ready fact-checking application that scrapes news sources across the political spectrum to provide balanced, AI-analyzed fact checks.

## Features

- **Real-time fact checking** using web scraping and AI analysis
- **Cross-spectrum analysis** from left, center, right, and international sources
- **Beautiful glassmorphism UI** with responsive design
- **Source credibility scoring** and favicon integration
- **Shareable summaries** optimized for social media
- **Production-ready architecture** with proper error handling

## Architecture

### Frontend (React + TypeScript + Tailwind)
- Modern React with TypeScript for type safety
- Tailwind CSS for beautiful, responsive design
- Lucide React for consistent iconography
- Real-time API integration with loading states

### Backend (Node.js + Express)
- Express.js API server with CORS support
- Web scraping using Cheerio and Axios
- OpenAI GPT-4 integration for AI analysis
- Modular service architecture
- Comprehensive error handling

## News Sources

### Left-leaning Sources
- NPR, The Guardian, Vox, MSNBC, HuffPost, Slate, Mother Jones

### Center Sources  
- Reuters, Associated Press, PBS NewsHour, Axios, BBC News, The Hill, Bloomberg

### Right-leaning Sources
- Fox News, New York Post, Washington Examiner, Daily Wire, The Blaze, Breitbart, Newsmax

### International/Specialized
- Ground.News, AllSides, Al Jazeera

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start the Backend Server
```bash
npm run server
```

### 4. Start the Frontend (in a new terminal)
```bash
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## API Endpoints

### POST /api/analyze
Analyzes a claim by scraping relevant articles and using AI analysis.

**Request:**
```json
{
  "claim": "Your claim to fact-check"
}
```

**Response:**
```json
{
  "claim": "string",
  "overallRating": "TRUE|MOSTLY TRUE|MIXED|MOSTLY FALSE|FALSE|UNVERIFIED",
  "confidence": 85,
  "tweetableSummary": "Shareable summary under 280 characters",
  "results": [
    {
      "id": "unique-id",
      "source": "Source Name",
      "category": "left|center|right|international",
      "rating": "true|mostly-true|mixed|mostly-false|false|unverified",
      "summary": "Analysis summary",
      "url": "https://source-url.com",
      "credibilityScore": 85,
      "favicon": "https://source.com/favicon.ico"
    }
  ],
  "analysisTime": 2.3
}
```

### GET /api/health
Returns server health status.

## Technical Implementation

### Web Scraping Strategy
- Uses Google site search for reliable article discovery
- Implements retry logic and timeout handling
- Respects rate limits and includes proper headers
- Parses search results to extract relevant articles

### AI Analysis
- OpenAI GPT-4 for intelligent fact analysis
- Structured prompts for consistent output
- Fallback to mock analysis if API unavailable
- JSON response parsing with error handling

### Error Handling
- Comprehensive try-catch blocks throughout
- Graceful degradation when sources are unavailable
- User-friendly error messages
- Detailed logging for debugging

### Performance Optimizations
- Parallel source scraping with Promise.allSettled
- Request timeouts and retry mechanisms
- Result limiting to prevent overwhelming responses
- Efficient data structures and minimal processing

## Production Considerations

### Security
- CORS configuration for cross-origin requests
- Input validation and sanitization
- API key protection via environment variables
- Rate limiting considerations for production deployment

### Scalability
- Modular service architecture for easy scaling
- Database integration ready (add your preferred DB)
- Caching layer can be added for frequently checked claims
- Load balancing ready with stateless design

### Monitoring
- Health check endpoint for uptime monitoring
- Comprehensive error logging
- Performance metrics tracking ready
- API usage analytics ready

## Deployment

### Environment Variables for Production
```bash
OPENAI_API_KEY=your_production_api_key
PORT=3001
NODE_ENV=production
```

### Docker Support (Optional)
The application is containerization-ready. Add Dockerfile and docker-compose.yml as needed.

### Hosting Recommendations
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Railway, Render, Heroku, or AWS EC2/ECS
- **Database**: PostgreSQL on AWS RDS or similar (when adding persistence)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This application is for educational and informational purposes. Always verify important claims through multiple sources and use critical thinking when evaluating information.