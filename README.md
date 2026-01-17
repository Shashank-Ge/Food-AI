# AI Food Analysis Platform

A full-stack web application that analyzes food images using AI to provide nutritional insights and meal recommendations.

## What it does

- Upload food images or paste image URLs for analysis
- AI-powered food identification with health ratings and reasoning
- Real-time image preview with analysis progress indicators
- Persistent history of past analyses with clear functionality
- Responsive design that works across devices

## Tech Stack

**Frontend:** React, modern CSS, responsive UI  
**Backend:** Node.js, Express, MongoDB (Mongoose)  
**External Services:** Groq API (AI analysis), Cloudinary (image storage)

## Architecture

The application follows a standard client-server architecture. Users upload images or provide URLs through the React frontend. The Express backend processes requests, downloads/validates images, uploads them to Cloudinary for storage, sends them to Groq's vision API for analysis, and stores results in MongoDB. The frontend displays analysis results and maintains a history panel.

## Local Setup

### Backend Setup

1. Navigate to server directory and install dependencies:
```bash
cd server
npm install
```

2. Copy environment template and add your credentials:
```bash
cp .env.example .env
# Edit .env with your actual API keys and database URL
```

3. Start the server:
```bash
npm start
```

Server runs on port 5000 by default.

### Frontend Setup

1. Navigate to client directory and install dependencies:
```bash
cd client
npm install
```

2. Start the development server:
```bash
npm start
```

Frontend runs on port 3000 and proxies API calls to the backend.

## Environment Variables

**Backend (.env file required):**
- `GROQ_API_KEY`
- `MONGO_URI` 
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PORT` (optional, defaults to 5000)
- `NODE_ENV` (optional, defaults to development)

**Frontend (optional):**
- `REACT_APP_API_URL` (defaults to http://localhost:5000 in development)

## API Endpoints

- `GET /` - Health check
- `POST /upload` - Analyze uploaded image file
- `POST /analyze-url` - Analyze image from URL
- `GET /history` - Retrieve analysis history
- `DELETE /history` - Clear all history

## Deployment

**Backend:** Deploy to Render, Railway, or similar. Set environment variables and use `npm start` as the start command.

**Frontend:** Deploy to Vercel, Netlify, or similar. Build command is `npm run build`, output directory is `build`. Set `REACT_APP_API_URL` to your backend URL.

## Demo

Live demo: [Add your deployed URL here]  
Backend API: [Add your backend URL here]

## Notes

The application gracefully handles network failures and invalid URLs by suggesting users switch to file upload mode. MongoDB connection is optional - the app continues to work for analysis even if the database is unavailable (history features will be disabled).