# AI Nutrition Analysis Platform

A production-ready React + Node.js application that analyzes food images using AI to provide nutritional insights and recommendations.

## Features

- **Image Upload Analysis**: Upload food images for AI-powered nutritional analysis
- **URL Analysis**: Analyze food images directly from URLs
- **Real-time Results**: Get instant AI-generated health ratings and recommendations
- **Meal History**: Track and review previous analyses
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

**Frontend:**
- React 18 with Hooks
- Modern CSS with CSS Grid/Flexbox
- Responsive design with mobile-first approach

**Backend:**
- Node.js with Express
- MongoDB for data persistence
- Cloudinary for image storage
- Groq AI for food analysis
- Sharp for image processing

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── App.js          # Main app component
│   │   └── App.css         # Styles
│   └── public/
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Business logic
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # External service integrations
│   └── index.js            # Server entry point
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js 16+
- MongoDB
- Cloudinary account
- Groq API key

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Installation

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Start the development servers:**
   
   Backend (from server directory):
   ```bash
   npm start
   ```
   
   Frontend (from client directory):
   ```bash
   npm start
   ```

## API Endpoints

- `POST /upload` - Upload and analyze food image
- `POST /analyze-url` - Analyze food image from URL
- `GET /history` - Get meal analysis history
- `DELETE /history` - Clear meal history
- `GET /` - Health check

## Deployment

The application is structured for easy deployment to platforms like:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, Heroku, or any Node.js hosting
- **Database**: MongoDB Atlas or any MongoDB hosting

## Development Notes

- The app works without database connection (analysis still functions)
- Cloudinary is optional - the app gracefully handles upload failures
- All external service failures are handled gracefully
- The frontend is fully responsive and works offline for UI interactions

## License

MIT License - feel free to use this project as a starting point for your own applications.